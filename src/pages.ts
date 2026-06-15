import { PLANS } from "./plans";
import { esc } from "./util";

const STYLE = `
:root{--bg:#0b0b10;--panel:#15151d;--panel2:#1d1d28;--line:#2a2a38;--text:#e9e9f1;--muted:#9a9ab0;--accent:#6366f1;--accent2:#a855f7;--good:#34d399;--warn:#fbbf24}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif}
a{color:var(--accent2);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:1040px;margin:0 auto;padding:24px}
.nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:16px 24px;border-bottom:1px solid var(--line)}
.brand{font-weight:700;font-size:18px;background:linear-gradient(90deg,var(--accent),var(--accent2));-webkit-background-clip:text;background-clip:text;color:transparent}
.btn{display:inline-block;background:linear-gradient(90deg,var(--accent),var(--accent2));color:#fff;border:0;border-radius:10px;padding:10px 16px;font-weight:600;cursor:pointer;font-size:14px}
.btn:hover{opacity:.92;text-decoration:none}
.btn.ghost{background:transparent;border:1px solid var(--line);color:var(--text)}
.btn.sm{padding:6px 10px;font-size:13px;border-radius:8px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:18px}
.grid{display:grid;gap:16px}
.cols-2{grid-template-columns:repeat(auto-fit,minmax(280px,1fr))}
.cols-3{grid-template-columns:repeat(auto-fit,minmax(240px,1fr))}
input,textarea,select{width:100%;background:var(--panel2);border:1px solid var(--line);border-radius:10px;color:var(--text);padding:10px 12px;font:inherit}
label{display:block;font-size:13px;color:var(--muted);margin:12px 0 4px}
.muted{color:var(--muted)}
.hero{padding:64px 0 32px;text-align:center}
.hero h1{font-size:42px;line-height:1.1;margin:0 0 16px}
.hero p{font-size:18px;color:var(--muted);max-width:640px;margin:0 auto 24px}
.pill{display:inline-block;font-size:12px;border:1px solid var(--line);border-radius:999px;padding:3px 10px;color:var(--muted)}
.stars{color:var(--warn);letter-spacing:2px}
.t{border:1px solid var(--line);border-radius:14px;padding:16px;background:var(--panel)}
.t .who{display:flex;align-items:center;gap:10px;margin-top:12px}
.t .who img{width:34px;height:34px;border-radius:50%;object-fit:cover;background:var(--panel2)}
.tag{font-size:11px;padding:2px 8px;border-radius:6px;border:1px solid var(--line);color:var(--muted)}
.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.right{margin-left:auto}
table{width:100%;border-collapse:collapse}
th,td{text-align:left;padding:8px;border-bottom:1px solid var(--line);font-size:14px;vertical-align:top}
code,pre{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
pre{background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:12px;overflow:auto;font-size:13px}
.foot{color:var(--muted);font-size:12px;text-align:center;padding:32px 0}
.price{font-size:30px;font-weight:700}
`;

export function layout(
  title: string,
  body: string,
  opts: { nav?: boolean; foot?: string | false } = {},
) {
  const nav = opts.nav === false
    ? ""
    : `<div class="nav"><a class="brand" href="/">ProofClip</a>
       <div class="row"><a href="/#pricing">Pricing</a><a class="btn sm" href="/signup">Get started</a></div></div>`;
  const foot = opts.foot === false
    ? ""
    : `<div class="foot">${opts.foot ?? "ProofClip &middot; testimonial walls + social proof"}</div>`;
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><style>${STYLE}</style></head>
<body>${nav}${body}${foot}</body></html>`;
}

export function landingPage(): string {
  const plans = Object.values(PLANS)
    .map(
      (p) => `<div class="card">
        <div class="pill">${esc(p.label)}</div>
        <div class="price">$${p.price}<span class="muted" style="font-size:14px">/mo</span></div>
        <ul class="muted" style="padding-left:18px;line-height:1.9">
          <li>${p.maxTestimonials === Infinity ? "Unlimited" : p.maxTestimonials} testimonials</li>
          <li>${p.maxWidgets === Infinity ? "Unlimited" : p.maxWidgets} widget${p.maxWidgets === 1 ? "" : "s"}</li>
          <li>${p.canRemoveBranding ? "No branding" : "Branded widget"}</li>
          <li>${p.canUseCards ? "Social card generator" : "Wall + widgets"}</li>
          ${p.whiteLabel ? "<li>White-label + 10 workspaces</li>" : ""}
        </ul>
        <a class="btn" href="/signup">Choose ${esc(p.label)}</a>
      </div>`,
    )
    .join("");

  return layout(
    "ProofClip: testimonial walls + social proof",
    `<div class="wrap">
      <div class="hero">
        <span class="pill">For creators &amp; small SaaS</span>
        <h1>Turn customer love into website proof and viral content.</h1>
        <p>Collect testimonials, import review screenshots from anywhere, embed a wall of love, and turn each one into a share-ready social card. Free to start.</p>
        <div class="row" style="justify-content:center">
          <a class="btn" href="/signup">Start free</a>
          <a class="btn ghost" href="/demo">See a live wall</a>
        </div>
      </div>
      <div class="grid cols-3">
        <div class="card"><b>Collect</b><p class="muted">A shareable form: text, rating, photo, permission. One link to gather proof.</p></div>
        <div class="card"><b>Import</b><p class="muted">Upload screenshots of DMs, comments and reviews. All your proof in one place.</p></div>
        <div class="card"><b>Show &amp; share</b><p class="muted">Embed a wall on your site, then export any testimonial as a 9:16 / 1:1 / wide card.</p></div>
      </div>
      <h2 id="pricing" style="margin-top:40px">Pricing</h2>
      <div class="grid cols-2">${plans}</div>
    </div>`,
  );
}

export function signupPage(): string {
  return layout(
    "Sign up: ProofClip",
    `<div class="wrap" style="max-width:460px">
      <h1>Create your account</h1>
      <p class="muted">Enter your email. We generate an API key that is your login: keep it safe.</p>
      <form method="post" action="/signup">
        <label>Email</label>
        <input name="email" type="email" required placeholder="you@brand.com">
        <label>Brand / wall name</label>
        <input name="name" required placeholder="Acme Templates">
        <div style="height:14px"></div>
        <button class="btn" type="submit">Create account</button>
      </form>
      <p class="muted" style="margin-top:16px">Already have a key? <a href="/login">Open dashboard</a></p>
    </div>`,
  );
}

export function loginPage(error?: string): string {
  return layout(
    "Open dashboard: ProofClip",
    `<div class="wrap" style="max-width:460px">
      <h1>Open dashboard</h1>
      ${error ? `<p style="color:#f87171">${esc(error)}</p>` : ""}
      <form method="get" action="/app">
        <label>API key</label>
        <input name="key" required placeholder="pk_...">
        <div style="height:14px"></div>
        <button class="btn" type="submit">Open</button>
      </form>
    </div>`,
  );
}

export function keyIssuedPage(apiKey: string, slug: string, base: string): string {
  return layout(
    "Account created: ProofClip",
    `<div class="wrap" style="max-width:560px">
      <h1>You are in.</h1>
      <p class="muted">This is your API key. It is your login and it is shown once. Save it now.</p>
      <pre>${esc(apiKey)}</pre>
      <p>Your collection link to share with customers:</p>
      <pre>${esc(base)}/c/${esc(slug)}</pre>
      <a class="btn" href="/app?key=${encodeURIComponent(apiKey)}">Go to dashboard</a>
    </div>`,
    { nav: false },
  );
}
