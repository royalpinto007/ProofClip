import type { Space, Testimonial } from "./types";
import { esc } from "./util";
import { layout } from "./pages";

const stars = (r: number | null) =>
  r ? `<div class="stars">${"&#9733;".repeat(r)}${"&#9734;".repeat(5 - r)}</div>` : "";

const avatar = (t: Testimonial) =>
  t.avatar_url
    ? `<img src="${esc(t.avatar_url)}" alt="">`
    : `<div style="width:34px;height:34px;border-radius:50%;background:#2a2a38;display:flex;align-items:center;justify-content:center;font-weight:700">${esc((t.name || "?").slice(0, 1).toUpperCase())}</div>`;

export function testimonialCard(t: Testimonial): string {
  const body = t.image_url
    ? `<img src="${esc(t.image_url)}" alt="testimonial" style="width:100%;border-radius:10px">`
    : `<div>${esc(t.text)}</div>`;
  const who = t.name || t.handle || t.company
    ? `<div class="who">${avatar(t)}<div>
         <div style="font-weight:600">${esc(t.name || t.handle || "")}</div>
         <div class="muted" style="font-size:13px">${esc([t.company, t.handle].filter(Boolean).join(" &middot; "))}</div>
       </div></div>`
    : "";
  return `<div class="t reveal">${stars(t.rating)}${body}${who}</div>`;
}

// Public collection form for a space.
export function collectionForm(space: Space, ok = false): string {
  const accent = esc(space.accent || "#6366f1");
  return layout(
    `Leave a testimonial for ${space.name}`,
    `<div class="wrap" style="max-width:980px;padding-top:44px">
      <div class="hero-panel">
      <div>
        ${space.logo_url ? `<img src="${esc(space.logo_url)}" alt="" style="height:44px;margin-bottom:10px">` : ""}
        <span class="pill">Customer testimonial</span>
        <h1 style="font-size:clamp(34px,5vw,56px);line-height:1.04;letter-spacing:-1.3px;margin:16px 0 12px">Share your experience with <span class="g">${esc(space.name)}</span></h1>
        <p class="muted" style="margin:0;max-width:520px;font-size:17px">A short note helps other customers understand what worked for you. It takes about 30 seconds.</p>
      </div>
      <div>
      ${ok ? `<div class="card reveal" style="border-color:${accent};margin-bottom:16px"><b>Thank you.</b><p class="muted" style="margin:6px 0 0">Your testimonial was submitted and is awaiting review.</p></div>` : ""}
      <form class="card reveal" method="post" action="/c/${esc(space.slug)}" enctype="multipart/form-data">
        <label>Your testimonial *</label>
        <textarea name="text" rows="4" required placeholder="What did you love?"></textarea>
        <label>Rating</label>
        <select name="rating">
          <option value="5">5 stars</option><option value="4">4 stars</option>
          <option value="3">3 stars</option><option value="2">2 stars</option>
          <option value="1">1 star</option><option value="">No rating</option>
        </select>
        <div class="grid cols-2">
          <div><label>Your name</label><input name="name" placeholder="Jane Doe"></div>
          <div><label>Company / handle</label><input name="company" placeholder="Acme / @jane"></div>
        </div>
        <label>Photo (optional)</label>
        <div class="upload-zone"><b>Add a photo</b><span class="muted" style="font-size:13px">Optional, but it makes the testimonial more trustworthy.</span><input type="file" name="avatar" accept="image/*"></div>
        <label class="row" style="margin-top:14px"><input type="checkbox" name="permission" value="1" style="width:auto;margin-right:8px" required> I allow ${esc(space.name)} to publish this testimonial.</label>
        <div style="height:14px"></div>
        <button class="btn" type="submit" style="background:${accent}">Submit testimonial</button>
      </form>
      </div>
      </div>
    </div>`,
    { nav: false },
  );
}

// Public wall of love page.
export function wallPage(space: Space, items: Testimonial[]): string {
  const cards = items.length
    ? items.map(testimonialCard).join("")
    : `<p class="muted">No testimonials yet.</p>`;
  return layout(
    `${space.name}: wall of love`,
    `<div class="wrap">
      <div style="text-align:center;margin:46px 0 30px">
        ${space.logo_url ? `<img src="${esc(space.logo_url)}" alt="" style="height:48px;margin-bottom:8px">` : ""}
        <span class="eyebrow"><span class="dot"></span><span class="pill">Wall of love</span></span>
        <h1 style="font-size:clamp(34px,5vw,58px);line-height:1.04;letter-spacing:-1.4px;margin:10px auto 0;max-width:820px">What people say about <span class="g">${esc(space.name)}</span></h1>
      </div>
      <div class="grid cols-3">${cards}</div>
    </div>`,
    { nav: false, foot: space.branding ? 'Collected with <a href="/">ProofClip</a>' : false },
  );
}
