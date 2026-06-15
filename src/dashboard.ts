import type { Account, Space, Testimonial } from "./types";
import { planFor } from "./plans";
import { esc } from "./util";
import { layout } from "./pages";
import { testimonialCard } from "./public";

interface DashData {
  account: Account;
  spaces: Space[];
  space: Space;
  testimonials: Testimonial[];
  counts: { total: number; approved: number; pending: number };
  analytics: { views: number; clicks: number };
  base: string;
}

const k = (key: string) => `key=${encodeURIComponent(key)}`;

function reviewRow(t: Testimonial, key: string, spaceId: string, canCards: boolean): string {
  const content = t.image_url
    ? `<img src="${esc(t.image_url)}" style="height:48px;border-radius:6px">`
    : esc((t.text || "").slice(0, 140));
  const action = (a: string, label: string, cls = "ghost") =>
    `<form method="post" action="/app/testimonial/${a}" style="display:inline">
       <input type="hidden" name="key" value="${esc(key)}">
       <input type="hidden" name="space" value="${esc(spaceId)}">
       <input type="hidden" name="id" value="${esc(t.id)}">
       <button class="btn sm ${cls}" type="submit">${label}</button></form>`;
  const cardBtn = canCards && t.status === "approved"
    ? `<a class="btn sm" href="/app/card?${k(key)}&id=${esc(t.id)}">Make card</a>`
    : "";
  return `<tr>
    <td><span class="tag">${esc(t.source)}</span> ${content}<div class="muted" style="font-size:12px">${esc(t.name || "")} ${esc(t.company || "")}</div></td>
    <td><span class="tag">${esc(t.status)}</span></td>
    <td><div class="row">
      ${t.status !== "approved" ? action("approve", "Approve") : ""}
      ${t.status !== "hidden" ? action("hide", "Hide") : action("approve", "Restore")}
      ${cardBtn}
      ${action("delete", "Delete")}
    </div></td>
  </tr>`;
}

export function dashboardPage(d: DashData): string {
  const key = d.account.api_key;
  const plan = planFor(d.account.plan);
  const limit = plan.maxTestimonials === Infinity ? "unlimited" : String(plan.maxTestimonials);
  const overLimit = d.counts.total >= plan.maxTestimonials;

  const wallUrl = `${d.base}/w/${d.space.slug}`;
  const collectUrl = `${d.base}/c/${d.space.slug}`;
  const widgetSnippet = `<div data-proofclip="${d.space.slug}"></div>\n<script async src="${d.base}/widget.js"></script>`;

  const spaceOptions = d.spaces
    .map((s) => `<option value="${esc(s.id)}" ${s.id === d.space.id ? "selected" : ""}>${esc(s.name)}</option>`)
    .join("");

  const rows = d.testimonials.length
    ? d.testimonials.map((t) => reviewRow(t, key, d.space.id, plan.canUseCards)).join("")
    : `<tr><td colspan="3" class="muted">No testimonials yet. Share your collection link.</td></tr>`;

  return layout(
    "Dashboard: ProofClip",
    `<div class="wrap">
      <div class="row">
        <h1 style="margin:0">Dashboard</h1>
        <span class="right pill">${esc(plan.label)} plan</span>
        ${d.account.plan === "free" ? '<a class="btn sm" href="/#pricing">Upgrade</a>' : ""}
      </div>

      ${d.spaces.length > 1 ? `<form method="get" action="/app" style="margin-top:12px">
        <input type="hidden" name="key" value="${esc(key)}">
        <div class="row"><span class="muted">Workspace</span>
        <select name="space" onchange="this.form.submit()" style="width:auto">${spaceOptions}</select></div>
      </form>` : ""}

      <div class="grid cols-3" style="margin-top:16px">
        <div class="card"><div class="muted">Testimonials</div><div class="price">${d.counts.total}<span class="muted" style="font-size:14px">/${limit}</span></div></div>
        <div class="card"><div class="muted">Widget views</div><div class="price">${d.analytics.views}</div></div>
        <div class="card"><div class="muted">Clicks</div><div class="price">${d.analytics.clicks}</div></div>
      </div>

      <div class="grid cols-2" style="margin-top:16px">
        <div class="card">
          <b>Collection link</b>
          <p class="muted" style="margin:6px 0">Share this with customers to gather testimonials.</p>
          <pre>${esc(collectUrl)}</pre>
          <a class="btn sm ghost" href="${esc(collectUrl)}" target="_blank">Open form</a>
        </div>
        <div class="card">
          <b>Wall of love</b>
          <p class="muted" style="margin:6px 0">A public page of your approved testimonials.</p>
          <pre>${esc(wallUrl)}</pre>
          <a class="btn sm ghost" href="${esc(wallUrl)}" target="_blank">Open wall</a>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <b>Embed widget</b>
        <p class="muted" style="margin:6px 0">Paste this where you want the wall to appear on your site.</p>
        <pre>${esc(widgetSnippet)}</pre>
      </div>

      <h2 style="margin-top:28px">Testimonials</h2>
      ${overLimit ? `<div class="card" style="border-color:#fbbf24"><b>Plan limit reached.</b> <span class="muted">You are at ${d.counts.total}/${limit}. <a href="/#pricing">Upgrade</a> to collect more.</span></div>` : ""}
      <div class="card" style="margin-top:8px;padding:0">
        <table><thead><tr><th>Testimonial</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody></table>
      </div>

      <div class="grid cols-2" style="margin-top:24px">
        <div class="card">
          <b>Import a screenshot</b>
          <p class="muted" style="margin:6px 0">Add proof from DMs, comments or reviews.</p>
          <form method="post" action="/app/import" enctype="multipart/form-data">
            <input type="hidden" name="key" value="${esc(key)}">
            <input type="hidden" name="space" value="${esc(d.space.id)}">
            <label>Screenshot</label><input type="file" name="image" accept="image/*">
            <label>Or paste text instead</label><textarea name="text" rows="2" placeholder="Optional"></textarea>
            <label>Name / source</label><input name="name" placeholder="@happycustomer">
            <div style="height:10px"></div>
            <button class="btn" type="submit" ${overLimit ? "disabled" : ""}>Import</button>
          </form>
        </div>

        <div class="card">
          <b>Branding</b>
          <form method="post" action="/app/settings">
            <input type="hidden" name="key" value="${esc(key)}">
            <input type="hidden" name="space" value="${esc(d.space.id)}">
            <label>Wall name</label><input name="name" value="${esc(d.space.name)}">
            <label>Accent color</label><input name="accent" value="${esc(d.space.accent)}">
            <label>Logo URL</label><input name="logo_url" value="${esc(d.space.logo_url || "")}">
            <label class="row" style="margin-top:12px">
              <input type="checkbox" name="branding" value="1" ${d.space.branding ? "checked" : ""} ${plan.canRemoveBranding ? "" : "disabled"} style="width:auto;margin-right:8px">
              Show "Powered by ProofClip" ${plan.canRemoveBranding ? "" : '<span class="muted">(upgrade to remove)</span>'}
            </label>
            <div style="height:10px"></div>
            <button class="btn" type="submit">Save</button>
          </form>
        </div>
      </div>
      <p class="muted" style="margin-top:24px">Your API key (login): <code>${esc(key)}</code></p>
    </div>`,
    { nav: false },
  );
}

export function cardStudioPage(t: Testimonial, space: Space, base: string): string {
  // Client-side canvas card generator. No external/paid API.
  const data = JSON.stringify({
    text: t.text || "",
    name: t.name || t.handle || "",
    company: t.company || "",
    rating: t.rating || 0,
    accent: space.accent || "#6366f1",
    brand: space.name,
    branding: !!space.branding,
  });
  return layout(
    "Card studio: ProofClip",
    `<div class="wrap" style="max-width:820px">
      <a href="javascript:history.back()">&larr; Back</a>
      <h1>Social proof card</h1>
      <p class="muted">Pick a ratio, then download a PNG to post.</p>
      <div class="row" style="margin:12px 0">
        <button class="btn sm" data-ratio="9:16">Story 9:16</button>
        <button class="btn sm ghost" data-ratio="1:1">Square 1:1</button>
        <button class="btn sm ghost" data-ratio="16:9">Wide 16:9</button>
        <button class="btn right" id="dl">Download PNG</button>
      </div>
      <canvas id="c" style="width:100%;max-width:520px;border:1px solid var(--line);border-radius:12px;background:#000"></canvas>
      <script>window.__CARD__=${data};</script>
      <script src="/card.js"></script>
    </div>`,
    { nav: false },
  );
}
