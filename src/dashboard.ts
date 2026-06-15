import type { Account, Space, Testimonial } from "./types";
import { planFor } from "./plans";
import { esc } from "./util";
import { layout } from "./pages";

interface DashData {
  account: Account;
  spaces: Space[];
  space: Space;
  testimonials: Testimonial[];
  counts: { total: number; approved: number; pending: number };
  analytics: { views: number; clicks: number };
  base: string;
}

// Sticky app bar shown on every authenticated page.
function appBar(d: { space: Space; spaces: Space[]; planLabel: string }): string {
  const switcher = d.spaces.length > 1
    ? `<form method="get" action="/app" style="margin:0">
         <select name="space" onchange="this.form.submit()" style="width:auto;padding:6px 10px">
           ${d.spaces.map((s) => `<option value="${esc(s.id)}" ${s.id === d.space.id ? "selected" : ""}>${esc(s.name)}</option>`).join("")}
         </select></form>`
    : `<span class="pill">${esc(d.space.name)}</span>`;
  return `<div class="nav">
    <a class="brand" href="/app">ProofClip</a>
    <div class="row">
      ${switcher}
      <span class="pill">${esc(d.planLabel)}</span>
      <a class="btn sm ghost" href="/#pricing">Plans</a>
      <a class="btn sm ghost" href="/logout">Log out</a>
    </div>
  </div>`;
}

// Copyable code block.
function copyBox(label: string, value: string, openHref?: string): string {
  const id = "cb_" + Math.abs(hash(value)).toString(36);
  return `<div>
    <div class="row" style="justify-content:space-between"><b>${esc(label)}</b>
      <div class="row">
        <button class="btn sm ghost" onclick="navigator.clipboard.writeText(document.getElementById('${id}').textContent);this.textContent='Copied'">Copy</button>
        ${openHref ? `<a class="btn sm ghost" href="${esc(openHref)}" target="_blank">Open</a>` : ""}
      </div>
    </div>
    <pre id="${id}" style="margin-top:8px">${esc(value)}</pre>
  </div>`;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}

function stars(r: number | null): string {
  return r ? `<span class="stars">${"&#9733;".repeat(r)}</span>` : "";
}

function reviewRow(t: Testimonial, spaceId: string, canCards: boolean): string {
  const content = t.image_url
    ? `<img src="${esc(t.image_url)}" style="height:54px;border-radius:8px">`
    : `<div>${esc((t.text || "").slice(0, 160))}</div>`;
  const act = (a: string, label: string, cls = "ghost") =>
    `<form method="post" action="/app/testimonial/${a}" style="display:inline;margin:0" ${a === "delete" ? `onsubmit="return confirm('Delete this testimonial permanently?')"` : ""}>
       <input type="hidden" name="space" value="${esc(spaceId)}">
       <input type="hidden" name="id" value="${esc(t.id)}">
       <button class="btn sm ${cls}" type="submit">${label}</button></form>`;
  const cardBtn = canCards && t.status === "approved"
    ? `<a class="btn sm" href="/app/card?id=${esc(t.id)}">Make card</a>`
    : "";
  const statusColor = t.status === "approved" ? "var(--good)" : t.status === "pending" ? "var(--warn)" : "var(--muted)";
  return `<tr>
    <td>${stars(t.rating)} ${content}<div class="muted" style="font-size:12px;margin-top:6px"><span class="tag">${esc(t.source)}</span> ${esc(t.name || "Unknown")} ${esc(t.company || "")}</div></td>
    <td><span class="tag" style="border-color:${statusColor};color:${statusColor}">${esc(t.status)}</span></td>
    <td><div class="row">
      ${t.status !== "approved" ? act("approve", "Approve") : ""}
      ${t.status !== "hidden" ? act("hide", "Hide") : act("approve", "Restore")}
      ${cardBtn}
      ${act("delete", "Delete")}
    </div></td>
  </tr>`;
}

export function dashboardPage(d: DashData): string {
  const plan = planFor(d.account.plan);
  const limit = plan.maxTestimonials === Infinity ? "&infin;" : String(plan.maxTestimonials);
  const overLimit = d.counts.total >= plan.maxTestimonials;

  const wallUrl = `${d.base}/w/${d.space.slug}`;
  const collectUrl = `${d.base}/c/${d.space.slug}`;
  const widgetSnippet = `<div data-proofclip="${d.space.slug}"></div>\n<script async src="${d.base}/widget.js"></script>`;

  const empty = d.counts.total === 0;

  // Onboarding shown until the first testimonial arrives.
  const onboarding = empty
    ? `<div class="card reveal" style="border-color:rgba(168,85,247,.4)">
        <h2 style="margin:0 0 4px">Welcome to ProofClip</h2>
        <p class="muted" style="margin:0 0 18px">ProofClip collects testimonials and turns them into a wall + social cards. Three steps to your first proof:</p>
        <div class="grid cols-3">
          <div class="card"><div class="pill">Step 1</div><h3 style="margin:10px 0 6px">Share your link</h3><p class="muted" style="font-size:14px">Send your collection link to a happy customer.</p><a class="btn sm" href="${esc(collectUrl)}" target="_blank">Open form</a></div>
          <div class="card"><div class="pill">Step 2</div><h3 style="margin:10px 0 6px">Approve it</h3><p class="muted" style="font-size:14px">New testimonials land here as <i>pending</i>. Approve the good ones.</p></div>
          <div class="card"><div class="pill">Step 3</div><h3 style="margin:10px 0 6px">Embed &amp; share</h3><p class="muted" style="font-size:14px">Paste the widget on your site, or export a social card.</p></div>
        </div>
        <div style="margin-top:14px" class="muted">Want to test it now? <a href="${esc(collectUrl)}" target="_blank">Submit a sample testimonial &rarr;</a></div>
      </div>`
    : "";

  const rows = d.testimonials.length
    ? d.testimonials.map((t) => reviewRow(t, d.space.id, plan.canUseCards)).join("")
    : `<tr><td colspan="3" class="muted" style="padding:20px">No testimonials yet. Share your collection link above to get your first one.</td></tr>`;

  return layout(
    "Dashboard: ProofClip",
    `${appBar({ space: d.space, spaces: d.spaces, planLabel: plan.label + " plan" })}
    <div class="wrap">
      <div class="row" style="margin-bottom:20px">
        <div><h1 style="margin:0;font-size:30px;letter-spacing:-.6px">Dashboard</h1>
        <div class="muted" style="font-size:14px">${esc(d.space.name)}</div></div>
        ${d.account.plan === "free" ? '<a class="btn right" href="/checkout/pro">Upgrade to Pro</a>' : '<span class="right"></span>'}
      </div>

      ${onboarding}

      <div class="grid cols-3" style="margin-top:18px">
        <div class="card metric reveal"><div class="muted">Testimonials</div><div class="price">${d.counts.total}<span class="muted" style="font-size:14px;font-weight:500">/${limit}</span></div><div class="muted" style="font-size:13px">${d.counts.pending} pending &middot; ${d.counts.approved} live</div></div>
        <div class="card metric reveal"><div class="muted">Widget views</div><div class="price">${d.analytics.views}</div><div class="muted" style="font-size:13px">Tracked from embeds</div></div>
        <div class="card metric reveal"><div class="muted">Clicks</div><div class="price">${d.analytics.clicks}</div><div class="muted" style="font-size:13px">Engagement events</div></div>
      </div>

      <div class="grid cols-3" style="margin-top:18px">
        <div class="card reveal">${copyBox("Collection link", collectUrl, collectUrl)}<p class="muted" style="font-size:13px;margin:10px 0 0">Share to gather testimonials.</p></div>
        <div class="card reveal">${copyBox("Wall of love", wallUrl, wallUrl)}<p class="muted" style="font-size:13px;margin:10px 0 0">Your public page of approved proof.</p></div>
        <div class="card reveal">${copyBox("Embed widget", widgetSnippet)}<p class="muted" style="font-size:13px;margin:10px 0 0">Paste into your site's HTML.</p></div>
      </div>

      <div class="section" style="padding:32px 0 0">
        <div class="toolbar"><div class="row"><h2 style="margin:0;font-size:24px">Testimonials</h2>
        ${d.counts.pending ? `<span class="pill" style="color:var(--warn);border-color:var(--warn)">${d.counts.pending} awaiting review</span>` : ""}</div>
        <a class="btn sm ghost" href="${esc(wallUrl)}" target="_blank">View wall</a></div>
        ${overLimit ? `<div class="card" style="border-color:var(--warn);margin-top:12px"><b>Plan limit reached.</b> <span class="muted">You are at ${d.counts.total}/${limit}. <a href="/checkout/pro">Upgrade</a> to collect more.</span></div>` : ""}
        <div class="card reveal" style="margin-top:12px;padding:0;overflow:hidden">
          <div class="table-wrap"><table><thead><tr><th>Testimonial</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>${rows}</tbody></table></div>
        </div>
      </div>

      <div class="grid cols-2" style="margin-top:28px">
        <div class="card reveal">
          <b>Import a screenshot</b>
          <p class="muted" style="margin:6px 0 4px;font-size:14px">Add proof from DMs, comments or reviews. Imported items go live immediately.</p>
          <form method="post" action="/app/import" enctype="multipart/form-data">
            <input type="hidden" name="space" value="${esc(d.space.id)}">
            <label>Screenshot</label>
            <div class="upload-zone">
              <b>Drop or choose a screenshot</b>
              <span class="muted" style="font-size:13px">PNG, JPG or WebP up to 5MB</span>
              <input type="file" name="image" accept="image/*">
            </div>
            <label>Or paste text instead</label><textarea name="text" rows="3" placeholder="Paste the review text when you do not have a screenshot"></textarea>
            <label>Name / source</label><input name="name" placeholder="@happycustomer">
            <div style="height:12px"></div>
            <button class="btn" type="submit" ${overLimit ? "disabled" : ""}>Import</button>
          </form>
        </div>

        <div class="card reveal">
          <b>Branding</b>
          <p class="muted" style="margin:6px 0 4px;font-size:14px">Customize how your wall and widget look.</p>
          <form method="post" action="/app/settings">
            <input type="hidden" name="space" value="${esc(d.space.id)}">
            <label>Wall name</label><input name="name" value="${esc(d.space.name)}">
            <div class="grid cols-2">
              <div><label>Accent color</label><input name="accent" type="text" value="${esc(d.space.accent)}"></div>
              <div><label>Logo URL</label><input name="logo_url" value="${esc(d.space.logo_url || "")}" placeholder="https://"></div>
            </div>
            <label class="row" style="margin-top:12px">
              <input type="checkbox" name="branding" value="1" ${d.space.branding ? "checked" : ""} ${plan.canRemoveBranding ? "" : "disabled"} style="width:auto;margin-right:8px">
              Show "Powered by ProofClip" ${plan.canRemoveBranding ? "" : '<span class="muted">(upgrade to remove)</span>'}
            </label>
            <div style="height:12px"></div>
            <button class="btn" type="submit">Save</button>
          </form>
        </div>
      </div>
    </div>`,
    { nav: false, foot: false },
  );
}

export function cardStudioPage(t: Testimonial, space: Space, base: string): string {
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
    `<div class="nav"><a class="brand" href="/app">ProofClip</a><a class="btn sm ghost" href="/app">&larr; Dashboard</a></div>
    <div class="wrap" style="max-width:840px">
      <h1 style="font-size:30px;letter-spacing:-.6px">Card studio</h1>
      <p class="muted">Pick a ratio, then download a PNG to post on social.</p>
      <div class="row" style="margin:16px 0">
        <button class="btn sm" data-ratio="9:16">Story 9:16</button>
        <button class="btn sm ghost" data-ratio="1:1">Square 1:1</button>
        <button class="btn sm ghost" data-ratio="16:9">Wide 16:9</button>
        <button class="btn right" id="dl">Download PNG</button>
      </div>
      <canvas id="c" style="width:100%;max-width:520px;border:1px solid var(--line);border-radius:14px;background:#000"></canvas>
      <script>window.__CARD__=${data};</script>
      <script src="/card.js"></script>
    </div>`,
    { nav: false, foot: false },
  );
}
