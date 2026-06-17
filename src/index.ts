import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import type { Account, Env, Space, Testimonial } from "./types";
import { PLANS, planFor } from "./plans";
import {
  getAccountByEmail,
  getAccountByKey,
  getSpaceById,
  getSpaceBySlug,
  spacesForAccount,
  testimonialsForSpace,
  countTestimonials,
} from "./db";
import {
  landingPage,
  signupPage,
  loginPage,
  keyIssuedPage,
  apiKeyResetPage,
  recoverySentPage,
  recoveryConfirmPage,
} from "./pages";
import { collectionForm, wallPage } from "./public";
import { dashboardPage, cardStudioPage } from "./dashboard";
import { WIDGET_JS, CARD_JS } from "./assets";
import {
  clampRating,
  esc,
  html,
  json,
  newId,
  newKey,
  now,
  slugify,
} from "./util";

const app = new Hono<{ Bindings: Env }>();

// ---------- session (httpOnly cookie, key never in URL) ----------
const SESSION = "pc_session";

function startSession(c: any, apiKey: string) {
  setCookie(c, SESSION, apiKey, {
    httpOnly: true,
    secure: String(c.env.PUBLIC_BASE_URL).startsWith("https"),
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 60, // 60 days
  });
}

async function sessionAccount(c: any): Promise<Account | null> {
  const key = getCookie(c, SESSION);
  if (!key) return null;
  return getAccountByKey(c.env, key);
}

// Resolve the account + an authorized space from the session cookie.
async function authedSpace(
  c: any,
  spaceId: string,
): Promise<{ account: Account; space: Space } | null> {
  const account = await sessionAccount(c);
  if (!account) return null;
  const space = await getSpaceById(c.env, spaceId);
  if (!space || space.account_id !== account.id) return null;
  return { account, space };
}

// ---------- helpers ----------
async function uploadMedia(env: Env, file: File): Promise<string | null> {
  if (!file || typeof file === "string" || file.size === 0) return null;
  if (file.size > 5 * 1024 * 1024) return null; // 5MB cap
  const ext = (file.type.split("/")[1] || "png").replace(/[^a-z0-9]/g, "");
  const key = `media/${newId("img")}.${ext}`;
  await env.MEDIA.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || "image/png" },
  });
  return `/${key}`;
}

async function recordEvent(
  env: Env,
  spaceId: string,
  type: "view" | "click",
) {
  await env.DB.prepare(
    "INSERT INTO events (id, space_id, type, created_at) VALUES (?,?,?,?)",
  )
    .bind(newId("ev"), spaceId, type, now())
    .run();
}

function constantTimeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const aa = enc.encode(a);
  const bb = enc.encode(b);
  let diff = aa.length ^ bb.length;
  const len = Math.max(aa.length, bb.length);
  for (let i = 0; i < len; i++) diff |= (aa[i] || 0) ^ (bb[i] || 0);
  return diff === 0;
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function sendRecoveryEmail(env: Env, to: string, link: string) {
  if (!env.RESEND_API_KEY) return;
  const from = env.EMAIL_FROM || "ProofClip <noreply@agentpostmortem.com>";
  const htmlBody = `
    <p>You asked to reset your ProofClip API key.</p>
    <p><a href="${esc(link)}">Create a new API key</a></p>
    <p>This link expires in 30 minutes. If you did not request this, ignore this email.</p>
  `;
  const text = `You asked to reset your ProofClip API key.\n\nCreate a new key: ${link}\n\nThis link expires in 30 minutes. If you did not request this, ignore this email.`;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Reset your ProofClip API key",
      html: htmlBody,
      text,
    }),
  });
}

async function parseWebhookBody(c: any): Promise<Record<string, string>> {
  const type = c.req.header("content-type") || "";
  if (type.includes("application/json")) {
    const data = await c.req.json();
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) out[key] = String(value ?? "");
    return out;
  }
  const form = await c.req.parseBody();
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(form)) {
    if (typeof value === "string") out[key] = value;
  }
  return out;
}

// True when a Gumroad ping signals the buyer should lose their paid plan:
// a refund/chargeback/dispute, or a membership that cancelled or ended.
function isDowngradeEvent(data: Record<string, string>): boolean {
  const truthy = (v: string | undefined) =>
    !!v && /^(true|1|yes)$/i.test(v.trim());
  if (truthy(data.refunded) || truthy(data.disputed) || truthy(data.chargedback)) return true;
  // Membership lifecycle pings (resource_name = cancellation / subscription_ended).
  if (truthy(data.cancelled) || truthy(data.ended)) return true;
  if (data.subscription_ended_at || data.subscription_cancelled_at || data.subscription_failed_at) return true;
  return false;
}

function inferPlan(data: Record<string, string>): string {
  const haystack = [
    data.plan,
    data.product,
    data.product_name,
    data.product_permalink,
    data.permalink,
    data.custom_permalink,
    data.variants,
    data.variant,
    data.variant_name,
    data.custom_fields,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/\bagency\b|proofclip-agency/.test(haystack)) return "agency";
  if (/\bpro\b|proofclip-pro/.test(haystack)) return "pro";
  if (/\bstarter\b|proofclip-starter/.test(haystack)) return "starter";
  return "";
}

async function activatePlan(
  env: Env,
  plan: string,
  accountId: string,
  email: string,
): Promise<number> {
  const query = accountId
    ? env.DB.prepare("UPDATE accounts SET plan = ? WHERE id = ?").bind(plan, accountId)
    : env.DB.prepare("UPDATE accounts SET plan = ? WHERE email = ?").bind(plan, email);
  const result = await query.run();
  return result.meta.changes ?? 0;
}

// ---------- public marketing ----------
app.get("/", (c) => html(landingPage()));
app.get("/signup", (c) => html(signupPage(c.req.query("plan"))));
app.get("/login", (c) => html(loginPage()));

app.get("/checkout/:plan", async (c) => {
  const planId = c.req.param("plan");
  if (planId === "free" || !(planId in PLANS)) return c.redirect("/signup");
  const account = await sessionAccount(c);
  if (!account) return c.redirect(`/signup?plan=${encodeURIComponent(planId)}`);
  const links: Record<string, string | undefined> = {
    starter: c.env.CHECKOUT_STARTER_URL,
    pro: c.env.CHECKOUT_PRO_URL,
    agency: c.env.CHECKOUT_AGENCY_URL,
  };
  const link = links[planId];
  if (!link) {
    return html(loginPage(`Checkout for ${planFor(planId).label} is not configured yet. Add a payment link in Cloudflare vars.`), 503);
  }
  const url = new URL(link);
  url.searchParams.set("client_reference_id", account.id);
  url.searchParams.set("prefilled_email", account.email);
  url.searchParams.set("email", account.email);
  url.searchParams.set("plan", planId);
  return c.redirect(url.toString());
});

app.post("/api/billing/activate", async (c) => {
  const secret = c.env.BILLING_WEBHOOK_SECRET;
  const provided = c.req.header("x-proofclip-secret") || c.req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!secret || !provided || !constantTimeEqual(provided, secret)) return json({ error: "unauthorized" }, 401);
  let body: Record<string, string> = {};
  try {
    body = await parseWebhookBody(c);
  } catch {
    return json({ error: "invalid body" }, 400);
  }
  const plan = String(body.plan || body.product || "").toLowerCase();
  if (!(plan in PLANS) || plan === "free") return json({ error: "invalid plan" }, 400);
  const accountId = String(body.account_id || body.client_reference_id || "").trim();
  const email = String(body.email || body.customer_email || "").trim().toLowerCase();
  if (!(await activatePlan(c.env, plan, accountId, email))) return json({ error: "account not found" }, 404);
  return json({ ok: true, plan });
});

app.post("/api/billing/gumroad", async (c) => {
  const secret = c.env.BILLING_WEBHOOK_SECRET;
  const provided = c.req.query("secret") || c.req.header("x-proofclip-secret") || "";
  if (!secret || !provided || !constantTimeEqual(provided, secret)) return json({ error: "unauthorized" }, 401);
  let body: Record<string, string> = {};
  try {
    body = await parseWebhookBody(c);
  } catch {
    return json({ error: "invalid body" }, 400);
  }
  const email = String(body.email || body.purchaser_email || body.customer_email || "").trim().toLowerCase();
  const accountId = String(body.client_reference_id || body.account_id || "").trim();
  // Refund / chargeback / membership cancellation -> drop back to free.
  if (isDowngradeEvent(body)) {
    // Only downgrade if the ping is about a ProofClip product (ignore unrelated sales).
    if (!inferPlan(body)) return json({ ok: true, provider: "gumroad", ignored: true });
    await activatePlan(c.env, "free", accountId, email);
    return json({ ok: true, provider: "gumroad", plan: "free", downgraded: true });
  }
  const plan = inferPlan(body);
  if (!plan || !(plan in PLANS)) return json({ error: "unknown gumroad plan" }, 400);
  if (!(await activatePlan(c.env, plan, accountId, email))) return json({ error: "account not found" }, 404);
  return json({ ok: true, provider: "gumroad", plan });
});

// Exchange an API key for a session cookie (key never lands in the URL).
app.post("/login", async (c) => {
  const body = await c.req.parseBody();
  const key = String(body.key || "").trim();
  const account = await getAccountByKey(c.env, key);
  if (!account) return html(loginPage("That key is not valid. Check and try again."), 401);
  startSession(c, key);
  return c.redirect("/app");
});

app.post("/login/recover", async (c) => {
  const body = await c.req.parseBody();
  const email = String(body.email || "").trim().toLowerCase();
  const account = email ? await getAccountByEmail(c.env, email) : null;
  if (account) {
    const token = newKey();
    const tokenHash = await sha256Hex(token);
    const expiresAt = now() + 30 * 60 * 1000;
    await c.env.DB.prepare("DELETE FROM api_key_resets WHERE account_id = ? OR expires_at < ? OR used_at IS NOT NULL")
      .bind(account.id, now())
      .run();
    await c.env.DB.prepare(
      "INSERT INTO api_key_resets (id, account_id, token_hash, expires_at, created_at) VALUES (?,?,?,?,?)",
    )
      .bind(newId("rst"), account.id, tokenHash, expiresAt, now())
      .run();
    const link = `${c.env.PUBLIC_BASE_URL}/login/recover?token=${encodeURIComponent(token)}`;
    c.executionCtx.waitUntil(sendRecoveryEmail(c.env, account.email, link));
  }
  return html(recoverySentPage());
});

app.get("/login/recover", async (c) => {
  const token = String(c.req.query("token") || "").trim();
  if (!token) return html(recoveryConfirmPage("", "This reset link is missing its token."), 400);
  const tokenHash = await sha256Hex(token);
  const reset = await c.env.DB.prepare(
    "SELECT id FROM api_key_resets WHERE token_hash = ? AND expires_at > ? AND used_at IS NULL",
  )
    .bind(tokenHash, now())
    .first<{ id: string }>();
  if (!reset) return html(recoveryConfirmPage("", "This reset link is invalid or expired."), 400);
  return html(recoveryConfirmPage(token));
});

app.post("/login/recover/confirm", async (c) => {
  const body = await c.req.parseBody();
  const token = String(body.token || "").trim();
  const tokenHash = await sha256Hex(token);
  const reset = await c.env.DB.prepare(
    "SELECT id, account_id FROM api_key_resets WHERE token_hash = ? AND expires_at > ? AND used_at IS NULL",
  )
    .bind(tokenHash, now())
    .first<{ id: string; account_id: string }>();
  if (!reset) return html(recoveryConfirmPage("", "This reset link is invalid or expired."), 400);
  const apiKey = newKey();
  await c.env.DB.batch([
    c.env.DB.prepare("UPDATE accounts SET api_key = ? WHERE id = ?").bind(apiKey, reset.account_id),
    c.env.DB.prepare("UPDATE api_key_resets SET used_at = ? WHERE id = ?").bind(now(), reset.id),
    c.env.DB.prepare("DELETE FROM api_key_resets WHERE account_id = ? AND id != ?").bind(reset.account_id, reset.id),
  ]);
  startSession(c, apiKey);
  return c.html(apiKeyResetPage(apiKey));
});

app.get("/logout", (c) => {
  deleteCookie(c, SESSION, { path: "/" });
  return c.redirect("/");
});

app.post("/app/api-key/reset", async (c) => {
  const account = await sessionAccount(c);
  if (!account) return html(loginPage("Please log in."), 401);
  const apiKey = newKey();
  await c.env.DB.prepare("UPDATE accounts SET api_key = ? WHERE id = ?")
    .bind(apiKey, account.id)
    .run();
  startSession(c, apiKey);
  return c.html(apiKeyResetPage(apiKey));
});

app.post("/signup", async (c) => {
  const body = await c.req.parseBody();
  const email = String(body.email || "").trim().toLowerCase();
  const name = String(body.name || "").trim() || "My wall";
  const selectedPlan = String(body.plan || "").toLowerCase();
  const checkoutPlan = selectedPlan !== "free" && selectedPlan in PLANS ? selectedPlan : "";
  if (!email) return html(signupPage(), 400);
  if (await getAccountByEmail(c.env, email)) {
    return html(loginPage("That email already has an account. Use your API key to log in."), 409);
  }
  const account = {
    id: newId("acc"),
    email,
    api_key: newKey(),
    plan: "free",
    created_at: now(),
  };
  await c.env.DB.prepare(
    "INSERT INTO accounts (id,email,api_key,plan,created_at) VALUES (?,?,?,?,?)",
  )
    .bind(account.id, account.email, account.api_key, account.plan, account.created_at)
    .run();
  const slug = slugify(name);
  await c.env.DB.prepare(
    "INSERT INTO spaces (id,account_id,slug,name,accent,branding,created_at) VALUES (?,?,?,?,?,?,?)",
  )
    .bind(newId("sp"), account.id, slug, name, "#6366f1", 1, now())
    .run();
  startSession(c, account.api_key); // log them straight in
  // Return via the Hono context so the Set-Cookie header is preserved.
  return c.html(keyIssuedPage(account.api_key, slug, c.env.PUBLIC_BASE_URL, checkoutPlan));
});

// ---------- demo (no auth, sample data) ----------
app.get("/demo", (c) => {
  const space: Space = {
    id: "demo", account_id: "demo", slug: "demo", name: "Acme Templates",
    accent: "#6366f1", logo_url: null, branding: 1, created_at: now(),
  };
  const sample = (text: string, name: string, company: string, rating: number): Testimonial => ({
    id: newId("t"), space_id: "demo", source: "form", name, handle: null,
    company, avatar_url: null, rating, text, image_url: null,
    status: "approved", permission: 1, created_at: now(),
  });
  const items = [
    sample("Set up our wall in ten minutes and the social cards got 3x the engagement of our normal posts.", "Maya R.", "Founder, Notionly", 5),
    sample("Finally one place for every review screenshot. The embed just works.", "Dev P.", "@devbuilds", 5),
    sample("Closed two deals after adding the wall to our pricing page.", "Sara K.", "Indie SaaS", 5),
  ];
  return html(wallPage(space, items));
});

// ---------- dashboard ----------
app.get("/app", async (c) => {
  // Migrate any legacy ?key=... link into a cookie, then strip it from the URL.
  const legacy = c.req.query("key");
  if (legacy) {
    const acc = await getAccountByKey(c.env, legacy);
    if (acc) {
      startSession(c, legacy);
      const sp = c.req.query("space");
      return c.redirect(sp ? `/app?space=${encodeURIComponent(sp)}` : "/app");
    }
  }
  const account = await sessionAccount(c);
  if (!account) return html(loginPage("Please log in with your API key."), 401);
  const spaces = await spacesForAccount(c.env, account.id);
  if (!spaces.length) return html(loginPage("No workspace found."), 404);
  const wantId = c.req.query("space");
  const space = spaces.find((s) => s.id === wantId) ?? spaces[0];
  const testimonials = await testimonialsForSpace(c.env, space.id);
  const approved = testimonials.filter((t) => t.status === "approved").length;
  const pending = testimonials.filter((t) => t.status === "pending").length;
  const ev = await c.env.DB.prepare(
    "SELECT type, COUNT(*) AS n FROM events WHERE space_id = ? GROUP BY type",
  ).bind(space.id).all<{ type: string; n: number }>();
  const views = ev.results?.find((r) => r.type === "view")?.n ?? 0;
  const clicks = ev.results?.find((r) => r.type === "click")?.n ?? 0;
  return html(dashboardPage({
    account, spaces, space, testimonials,
    counts: { total: testimonials.length, approved, pending },
    analytics: { views, clicks },
    base: c.env.PUBLIC_BASE_URL,
  }));
});

const back = (c: any, spaceId: string) =>
  c.redirect(`/app?space=${encodeURIComponent(spaceId)}`);

app.post("/app/testimonial/:action", async (c) => {
  const action = c.req.param("action");
  const body = await c.req.parseBody();
  const auth = await authedSpace(c, String(body.space || ""));
  if (!auth) return html(loginPage("Please log in."), 401);
  const { space } = auth;
  const id = String(body.id || "");
  if (action === "delete") {
    await c.env.DB.prepare("DELETE FROM testimonials WHERE id = ? AND space_id = ?").bind(id, space.id).run();
  } else if (action === "approve" || action === "hide") {
    const status = action === "approve" ? "approved" : "hidden";
    await c.env.DB.prepare("UPDATE testimonials SET status = ? WHERE id = ? AND space_id = ?").bind(status, id, space.id).run();
  }
  return back(c, space.id);
});

app.post("/app/import", async (c) => {
  const body = await c.req.parseBody();
  const auth = await authedSpace(c, String(body.space || ""));
  if (!auth) return html(loginPage("Please log in."), 401);
  const { account, space } = auth;
  const plan = planFor(account.plan);
  if ((await countTestimonials(c.env, space.id)) >= plan.maxTestimonials) {
    return back(c, space.id);
  }
  const imageUrl = await uploadMedia(c.env, body.image as File);
  const text = String(body.text || "").trim();
  if (!imageUrl && !text) return back(c, space.id);
  await c.env.DB.prepare(
    "INSERT INTO testimonials (id,space_id,source,name,text,image_url,status,permission,created_at) VALUES (?,?,?,?,?,?,?,?,?)",
  ).bind(
    newId("t"), space.id, "screenshot", String(body.name || "") || null,
    text || null, imageUrl, "approved", 1, now(),
  ).run();
  return back(c, space.id);
});

app.post("/app/settings", async (c) => {
  const body = await c.req.parseBody();
  const auth = await authedSpace(c, String(body.space || ""));
  if (!auth) return html(loginPage("Please log in."), 401);
  const { account, space } = auth;
  const plan = planFor(account.plan);
  // branding can only be turned OFF on plans that allow it
  let branding = body.branding ? 1 : 0;
  if (!plan.canRemoveBranding) branding = 1;
  const accent = String(body.accent || space.accent).slice(0, 9);
  const name = String(body.name || space.name).slice(0, 80);
  const logo = String(body.logo_url || "").slice(0, 500) || null;
  await c.env.DB.prepare(
    "UPDATE spaces SET name=?, accent=?, logo_url=?, branding=? WHERE id=?",
  ).bind(name, accent, logo, branding, space.id).run();
  return back(c, space.id);
});

app.get("/app/card", async (c) => {
  const account = await sessionAccount(c);
  if (!account) return html(loginPage("Please log in."), 401);
  if (!planFor(account.plan).canUseCards) {
    return html(loginPage("The card generator is a Pro feature. Upgrade to use it."), 403);
  }
  const t = await c.env.DB.prepare("SELECT * FROM testimonials WHERE id = ?")
    .bind(c.req.query("id") || "").first<Testimonial>();
  if (!t) return c.text("not found", 404);
  const space = await getSpaceById(c.env, t.space_id);
  if (!space || space.account_id !== account.id) return c.text("forbidden", 403);
  return html(cardStudioPage(t, space, c.env.PUBLIC_BASE_URL));
});

// ---------- public collection + wall ----------
app.get("/c/:slug", async (c) => {
  const space = await getSpaceBySlug(c.env, c.req.param("slug"));
  if (!space) return c.text("not found", 404);
  return html(collectionForm(space, c.req.query("ok") === "1"));
});

app.post("/c/:slug", async (c) => {
  const space = await getSpaceBySlug(c.env, c.req.param("slug"));
  if (!space) return c.text("not found", 404);
  const plan = planFor((await c.env.DB.prepare("SELECT plan FROM accounts WHERE id=?").bind(space.account_id).first<{ plan: string }>())?.plan || "free");
  if ((await countTestimonials(c.env, space.id)) >= plan.maxTestimonials) {
    return html(collectionForm(space, true)); // silently accept-cap; owner sees nothing new
  }
  const body = await c.req.parseBody();
  const text = String(body.text || "").trim();
  if (!text) return html(collectionForm(space), 400);
  const avatarUrl = await uploadMedia(c.env, body.avatar as File);
  await c.env.DB.prepare(
    "INSERT INTO testimonials (id,space_id,source,name,company,avatar_url,rating,text,status,permission,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
  ).bind(
    newId("t"), space.id, "form",
    String(body.name || "") || null, String(body.company || "") || null,
    avatarUrl, clampRating(body.rating), text, "pending",
    body.permission ? 1 : 0, now(),
  ).run();
  return c.redirect(`/c/${space.slug}?ok=1`);
});

app.get("/w/:slug", async (c) => {
  const space = await getSpaceBySlug(c.env, c.req.param("slug"));
  if (!space) return c.text("not found", 404);
  const items = await testimonialsForSpace(c.env, space.id, "approved");
  return html(wallPage(space, items));
});

// ---------- widget API ----------
app.get("/api/wall/:slug", async (c) => {
  const space = await getSpaceBySlug(c.env, c.req.param("slug"));
  if (!space) return json({ error: "not found" }, 404);
  const items = await testimonialsForSpace(c.env, space.id, "approved");
  const base = c.env.PUBLIC_BASE_URL;
  return new Response(
    JSON.stringify({
      space: space.slug,
      accent: space.accent,
      branding: !!space.branding,
      testimonials: items.map((t) => ({
        text: t.text,
        name: t.name,
        company: t.company,
        rating: t.rating,
        image_url: t.image_url ? base + t.image_url : null,
        avatar_url: t.avatar_url ? base + t.avatar_url : null,
      })),
    }),
    { headers: { "content-type": "application/json", "access-control-allow-origin": "*" } },
  );
});

app.post("/api/event", async (c) => {
  let data: any = {};
  try { data = await c.req.json(); } catch { /* sendBeacon blob */ }
  const slug = String(data.slug || "");
  const type = data.type === "click" ? "click" : "view";
  const space = await getSpaceBySlug(c.env, slug);
  if (space) await recordEvent(c.env, space.id, type);
  return new Response("", { status: 204, headers: { "access-control-allow-origin": "*" } });
});

// ---------- static assets + media ----------
app.get("/widget.js", () =>
  new Response(WIDGET_JS, { headers: { "content-type": "application/javascript", "cache-control": "public,max-age=300" } }));
app.get("/card.js", () =>
  new Response(CARD_JS, { headers: { "content-type": "application/javascript", "cache-control": "public,max-age=300" } }));

app.get("/media/:name", async (c) => {
  const obj = await c.env.MEDIA.get(`media/${c.req.param("name")}`);
  if (!obj) return c.text("not found", 404);
  return new Response(obj.body, {
    headers: {
      "content-type": obj.httpMetadata?.contentType || "image/png",
      "cache-control": "public,max-age=31536000,immutable",
    },
  });
});

app.notFound((c) => c.text("Not found", 404));

export default app;
