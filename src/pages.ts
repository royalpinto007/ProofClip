import { PLANS } from "./plans";
import { esc } from "./util";

const STYLE = `
:root{--bg:#090b10;--surface:#10141d;--surface2:#151b27;--panel:rgba(255,255,255,.055);--panel2:rgba(255,255,255,.08);--line:rgba(255,255,255,.11);--text:#f5f7fb;--muted:#aab2c5;--soft:#dbe4f3;--accent:#22c55e;--accent2:#38bdf8;--good:#34d399;--warn:#fbbf24;--bad:#fb7185;--maxw:1360px;--shadow:0 24px 70px -42px rgba(0,0,0,.85)}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.55 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;overflow-x:hidden}
body::before{content:"";position:fixed;inset:-12%;z-index:-2;background:
  radial-gradient(42% 36% at 18% 10%,rgba(56,189,248,.20),transparent 62%),
  radial-gradient(44% 34% at 82% 0%,rgba(34,197,94,.16),transparent 64%),
  linear-gradient(180deg,#0b111b 0%,#090b10 48%,#08090d 100%);
  animation:drift 24s ease-in-out infinite alternate}
body::after{content:"";position:fixed;inset:0;z-index:-1;background-image:linear-gradient(rgba(255,255,255,.032) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.032) 1px,transparent 1px);background-size:52px 52px;mask:linear-gradient(#000,transparent 88%)}
@keyframes drift{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-3%,2%,0) scale(1.06)}100%{transform:translate3d(3%,-2%,0) scale(1.02)}}
a{color:#7dd3fc;text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:var(--maxw);margin:0 auto;padding:32px 28px}
.nav{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 28px;border-bottom:1px solid var(--line);background:rgba(9,11,16,.78);backdrop-filter:blur(18px)}
.brand{font-weight:850;font-size:19px;letter-spacing:-.2px;color:#fff}.brand::before{content:"";display:inline-block;width:10px;height:10px;border-radius:3px;margin-right:9px;background:linear-gradient(135deg,var(--accent),var(--accent2));box-shadow:0 0 22px rgba(56,189,248,.5)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:#041016;border:0;border-radius:8px;padding:10px 16px;font-weight:800;cursor:pointer;font-size:14px;transition:transform .15s ease,box-shadow .25s ease,opacity .2s;box-shadow:0 12px 30px -16px rgba(34,197,94,.9);white-space:nowrap}
.btn:hover{transform:translateY(-1px);box-shadow:0 18px 36px -18px rgba(56,189,248,.95);text-decoration:none}
.btn:active{transform:translateY(0)}
.btn.ghost{background:rgba(255,255,255,.045);border:1px solid var(--line);color:var(--text);box-shadow:none}
.btn.ghost:hover{background:rgba(255,255,255,.085)}
.btn.sm{padding:7px 11px;font-size:13px;border-radius:7px}
.btn[disabled]{opacity:.45;cursor:not-allowed;transform:none}
.card{background:linear-gradient(180deg,rgba(255,255,255,.068),rgba(255,255,255,.035));border:1px solid var(--line);border-radius:8px;padding:22px;box-shadow:var(--shadow);backdrop-filter:blur(12px);transition:transform .18s ease,border-color .18s ease,background .18s ease}
.card:hover{transform:translateY(-2px);border-color:rgba(125,211,252,.32);background:linear-gradient(180deg,rgba(255,255,255,.085),rgba(255,255,255,.045))}
.grid{display:grid;gap:18px}
.cols-2{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.cols-3{grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}
.cols-4{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
input,textarea,select{width:100%;background:rgba(5,9,15,.72);border:1px solid var(--line);border-radius:8px;color:var(--text);padding:11px 12px;font:inherit;transition:border-color .15s,box-shadow .15s,background .15s}
input:focus,textarea:focus,select:focus{outline:0;border-color:var(--accent2);box-shadow:0 0 0 3px rgba(56,189,248,.16);background:rgba(7,12,20,.94)}
label{display:block;font-size:13px;color:var(--muted);margin:12px 0 4px}
.muted{color:var(--muted)}
.home-hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(360px,.95fr);gap:44px;align-items:center;padding:66px 0 42px}
.hero{padding:76px 0 38px;text-align:center;position:relative}
.home-hero .hero{padding:0;text-align:left}
.hero h1{font-size:clamp(38px,6vw,68px);line-height:1.02;margin:0 auto 18px;max-width:15ch;letter-spacing:-1.7px;font-weight:900}
.home-hero .hero h1{margin-left:0;margin-right:0;max-width:12ch}
.home-hero .hero p{margin-left:0;margin-right:0;max-width:640px}
.g{background:linear-gradient(100deg,#fff 8%,#7dd3fc 54%,#86efac 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{font-size:clamp(16px,2vw,20px);color:var(--muted);max-width:620px;margin:0 auto 28px}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:12px;border:1px solid var(--line);border-radius:999px;padding:5px 11px;color:var(--soft);background:rgba(255,255,255,.04)}
.eyebrow{display:inline-flex;align-items:center;gap:8px;margin-bottom:20px}
.eyebrow .dot{width:7px;height:7px;border-radius:50%;background:var(--good);box-shadow:0 0 0 0 rgba(52,211,153,.6);animation:pulse 2s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(52,211,153,.5)}70%{box-shadow:0 0 0 8px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}}
.section{padding:56px 0}
.section h2{font-size:clamp(26px,4vw,38px);letter-spacing:-.8px;margin:0 0 8px;font-weight:800}
.lead{color:var(--muted);max-width:560px;margin:0 0 28px}
.stars{color:var(--warn);letter-spacing:2px}
.t{border:1px solid var(--line);border-radius:8px;padding:18px;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.035));backdrop-filter:blur(8px);transition:transform .18s,border-color .18s}
.t:hover{transform:translateY(-2px);border-color:rgba(125,211,252,.34)}
.t .who{display:flex;align-items:center;gap:10px;margin-top:12px}
.t .who img{width:36px;height:36px;border-radius:50%;object-fit:cover;background:var(--panel2)}
.tag{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid var(--line);color:var(--muted);white-space:nowrap}
.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.right{margin-left:auto}
.toolbar{display:flex;gap:10px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.hero-panel{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(300px,.9fr);gap:26px;align-items:center}
.metric{padding:18px}.metric .price{line-height:1}
.table-wrap{overflow:auto}
table{width:100%;border-collapse:collapse}
th,td{text-align:left;padding:12px;border-bottom:1px solid var(--line);font-size:14px;vertical-align:top}
th{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.06em}
code,pre{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
pre{background:rgba(0,0,0,.32);border:1px solid var(--line);border-radius:8px;padding:13px;overflow:auto;font-size:12px;white-space:pre-wrap;word-break:break-word}
.foot{color:var(--muted);font-size:12px;text-align:center;padding:40px 0;border-top:1px solid var(--line);margin-top:40px}
.price{font-size:34px;font-weight:900;letter-spacing:-1px}
.plan-pop{position:relative;border-color:rgba(34,197,94,.48);box-shadow:0 24px 70px -38px rgba(34,197,94,.75)}
.plan-pop::after{content:"Popular";position:absolute;top:-11px;right:18px;font-size:11px;font-weight:800;color:#041016;background:linear-gradient(90deg,var(--accent),var(--accent2));padding:3px 10px;border-radius:999px}
.upload-zone{position:relative;border:1px dashed rgba(125,211,252,.42);border-radius:8px;background:rgba(56,189,248,.055);padding:18px;text-align:center}
.upload-zone input{position:absolute;inset:0;opacity:0;cursor:pointer}
.upload-zone b{display:block;color:#e0f2fe}
.mini-preview{border:1px solid var(--line);border-radius:8px;background:rgba(255,255,255,.04);padding:12px}
/* scroll reveal */
.reveal{opacity:0;transform:translateY(24px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
.reveal.in{opacity:1;transform:none}
/* floating hero cards */
.float-stack{position:relative;height:420px;max-width:620px;margin:0 auto;perspective:1000px}
.float-stack .fc{position:absolute;width:300px;text-align:left;will-change:transform}
.float-stack .fc:nth-child(1){top:0;left:28%;transform:translateX(-50%)}
.float-stack .fc:nth-child(2){top:130px;left:0;animation:bob 6s ease-in-out infinite}
.float-stack .fc:nth-child(3){top:170px;right:0;animation:bob 7s ease-in-out infinite .8s}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@media(max-width:860px){.home-hero,.hero-panel{grid-template-columns:1fr}.home-hero{padding:36px 0 20px}.home-hero .hero{text-align:center}.home-hero .hero h1,.home-hero .hero p{margin-left:auto;margin-right:auto}.home-hero .row{justify-content:center!important}.nav{align-items:flex-start}.wrap{padding:24px 18px}table{min-width:720px}.float-stack{height:auto;display:grid;gap:14px;perspective:none}.float-stack .fc{position:static;width:auto;transform:none!important;animation:none}}
@media(prefers-reduced-motion:reduce){*{animation:none!important}.reveal{opacity:1;transform:none}}
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
<body>${nav}${body}${foot}<script>${INTERACT_JS}</script></body></html>`;
}

// Lightweight global interactions: scroll reveal + pointer tilt. No deps.
const INTERACT_JS = `
(function(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
  document.querySelectorAll('[data-tilt]').forEach(function(el){
    el.addEventListener('mousemove',function(ev){var r=el.getBoundingClientRect();var x=(ev.clientX-r.left)/r.width-.5,y=(ev.clientY-r.top)/r.height-.5;el.style.transform='rotateY('+(x*10)+'deg) rotateX('+(-y*10)+'deg) translateY(-4px)';});
    el.addEventListener('mouseleave',function(){el.style.transform='';});
  });
})();`;

export function landingPage(): string {
  const plans = Object.values(PLANS)
    .map(
      (p) => `<div class="card reveal ${p.id === "pro" ? "plan-pop" : ""}">
        <div class="pill">${esc(p.label)}</div>
        <div class="price" style="margin:10px 0">$${p.price}<span class="muted" style="font-size:14px;font-weight:500">/mo</span></div>
        <ul class="muted" style="padding-left:18px;line-height:2;font-size:14px">
          <li>${p.maxTestimonials === Infinity ? "Unlimited" : p.maxTestimonials} testimonials</li>
          <li>${p.maxWidgets === Infinity ? "Unlimited" : p.maxWidgets} widget${p.maxWidgets === 1 ? "" : "s"}</li>
          <li>${p.canRemoveBranding ? "No branding" : "Branded widget"}</li>
          <li>${p.canUseCards ? "Social card generator" : "Wall + widgets"}</li>
          ${p.whiteLabel ? "<li>White-label + 10 workspaces</li>" : "<li>&nbsp;</li>"}
        </ul>
        <a class="btn ${p.id === "pro" ? "" : "ghost"}" style="width:100%;text-align:center" href="${p.id === "free" ? "/signup" : `/checkout/${p.id}`}">Choose ${esc(p.label)}</a>
      </div>`,
    )
    .join("");

  const fc = (text: string, name: string, who: string, r: number) => `
    <div class="fc card" data-tilt>
      <div class="stars">${"&#9733;".repeat(r)}</div>
      <div style="margin:8px 0 12px">${text}</div>
      <div class="row"><div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent2));display:flex;align-items:center;justify-content:center;font-weight:700">${esc(name[0])}</div>
      <div><b style="font-size:13px">${esc(name)}</b><div class="muted" style="font-size:12px">${esc(who)}</div></div></div>
    </div>`;

  return layout(
    "ProofClip: testimonial walls + social proof",
    `<div class="wrap" style="padding-top:8px">
      <div class="home-hero">
        <div class="hero">
          <span class="eyebrow"><span class="dot"></span><span class="pill">Live &middot; built for creators &amp; small SaaS</span></span>
          <h1>Turn customer love into <span class="g">website proof</span> and viral content.</h1>
          <p>Collect testimonials, import review screenshots from anywhere, embed a wall of love, and turn each one into a share-ready social card. Free to start.</p>
          <div class="row" style="justify-content:flex-start">
            <a class="btn" href="/signup">Start free</a>
            <a class="btn ghost" href="/demo">See a live wall &rarr;</a>
          </div>
        </div>
        <div class="float-stack reveal">
          ${fc("Set up our wall in ten minutes and the social cards got 3x our normal engagement.", "Maya", "Founder, Notionly", 5)}
          ${fc("Finally one place for every review screenshot. The embed just works.", "Dev", "@devbuilds", 5)}
          ${fc("Closed two deals after adding the wall to our pricing page.", "Sara", "Indie SaaS", 5)}
        </div>
      </div>

      <div class="section">
        <div class="reveal"><h2>Three steps to social proof</h2><p class="lead">No code beyond one embed tag. Everything runs on your link.</p></div>
        <div class="grid cols-3">
          <div class="card reveal"><div class="pill">01</div><h3 style="margin:12px 0 6px">Collect</h3><p class="muted">A shareable form: text, rating, photo, permission. One link to gather proof from happy customers.</p></div>
          <div class="card reveal"><div class="pill">02</div><h3 style="margin:12px 0 6px">Import</h3><p class="muted">Upload screenshots of DMs, comments and reviews. All your scattered proof in one place.</p></div>
          <div class="card reveal"><div class="pill">03</div><h3 style="margin:12px 0 6px">Show &amp; share</h3><p class="muted">Embed a wall on your site, then export any testimonial as a 9:16 / 1:1 / wide card.</p></div>
        </div>
      </div>

      <div class="section">
        <div class="reveal"><h2>One testimonial, every format</h2><p class="lead">Tap a ratio to preview the card you can post.</p></div>
        <div class="hero-panel reveal">
          <div class="card">
            <span class="pill">Social-card studio</span>
            <h3 style="font-size:28px;line-height:1.1;margin:14px 0 8px">Proof should move from your site to every feed.</h3>
            <p class="muted">Export customer quotes as story, square, or landscape PNGs without opening a design tool. This is the wedge that makes ProofClip more than another wall embed.</p>
          </div>
          <div>
          <div class="row" id="ratioRow">
            <button class="btn sm" data-r="9:16">Story 9:16</button>
            <button class="btn sm ghost" data-r="1:1">Square 1:1</button>
            <button class="btn sm ghost" data-r="16:9">Wide 16:9</button>
          </div>
          <div id="cardPrev" style="width:240px;aspect-ratio:9/16;border-radius:18px;border:1px solid var(--line);background:linear-gradient(150deg,#0b0b10,#1a1130);padding:22px;display:flex;flex-direction:column;justify-content:center;transition:aspect-ratio .4s ease,width .4s ease">
            <div style="width:42px;height:5px;border-radius:3px;background:linear-gradient(90deg,var(--accent),var(--accent2));margin-bottom:14px"></div>
            <div class="stars" style="font-size:18px">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <div style="font:600 18px/1.35 Georgia;margin:10px 0">&ldquo;ProofClip turned our reviews into content overnight.&rdquo;</div>
            <div style="color:var(--accent2);font-weight:700;font-size:13px">Maya R.</div>
            <div class="muted" style="font-size:12px">Founder, Notionly</div>
          </div>
          </div>
        </div>
      </div>

      <div class="section" id="pricing">
        <div class="reveal"><h2>Simple pricing</h2><p class="lead">Start free. Upgrade when proof starts converting.</p></div>
        <div class="grid cols-4">${plans}</div>
      </div>
    </div>
    <script>
    (function(){
      var R={"9:16":[240,"9/16"],"1:1":[300,"1/1"],"16:9":[420,"16/9"]};
      var prev=document.getElementById('cardPrev');
      document.querySelectorAll('#ratioRow [data-r]').forEach(function(b){
        b.addEventListener('click',function(){
          document.querySelectorAll('#ratioRow [data-r]').forEach(function(x){x.className='btn sm ghost';});
          b.className='btn sm';var v=R[b.getAttribute('data-r')];prev.style.width=v[0]+'px';prev.style.aspectRatio=v[1];
        });
      });
    })();
    </script>`,
  );
}

export function signupPage(plan?: string): string {
  const selectedPlan = plan && plan !== "free" && plan in PLANS ? plan : "";
  const planLine = selectedPlan
    ? `<p class="pill" style="margin:0 0 14px">Selected: ${esc(PLANS[selectedPlan as keyof typeof PLANS].label)} plan</p>`
    : "";
  return layout(
    "Sign up: ProofClip",
    `<div class="wrap" style="max-width:460px">
      <h1>Create your account</h1>
      <p class="muted">Enter your email. We generate an API key that is your login: keep it safe.</p>
      ${planLine}
      <form method="post" action="/signup">
        <input type="hidden" name="plan" value="${esc(selectedPlan)}">
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
    `<div class="wrap" style="max-width:520px">
      <h1>Open dashboard</h1>
      ${error ? `<p style="color:#f87171">${esc(error)}</p>` : ""}
      <form class="card" method="post" action="/login">
        <label>API key</label>
        <input name="key" type="password" required placeholder="pk_..." autocomplete="current-password">
        <div style="height:14px"></div>
        <button class="btn" type="submit">Open dashboard</button>
      </form>
      <div class="card" style="margin-top:14px">
        <b>Rotate API key</b>
        <p class="muted" style="margin:6px 0 0;font-size:14px">Have your current key but want a fresh one? Reset it here. The old key stops working immediately.</p>
        <form method="post" action="/login/reset" onsubmit="return confirm('Reset this API key? The old key will stop working immediately.')">
          <label>Current API key</label>
          <input name="key" type="password" required placeholder="pk_..." autocomplete="current-password">
          <div style="height:12px"></div>
          <button class="btn ghost" type="submit">Reset API key</button>
        </form>
      </div>
      <p class="muted" style="margin-top:14px">No account yet? <a href="/signup">Create one free</a></p>
    </div>`,
  );
}

export function keyIssuedPage(apiKey: string, slug: string, base: string, checkoutPlan = ""): string {
  const checkout = checkoutPlan
    ? `<div class="row"><a class="btn" href="/checkout/${esc(checkoutPlan)}">Continue to checkout</a><a class="btn ghost" href="/app">Open dashboard</a></div>`
    : `<a class="btn" href="/app">Go to dashboard &rarr;</a>`;
  return layout(
    "Account created: ProofClip",
    `<div class="wrap" style="max-width:600px">
      <span class="eyebrow"><span class="dot"></span><span class="pill">Account created</span></span>
      <h1 style="font-size:36px;letter-spacing:-1px">You are in.</h1>
      <div class="card" style="border-color:rgba(251,191,36,.4)">
        <b>Save your API key now</b>
        <p class="muted" style="margin:6px 0 10px">This is your login. It is shown once. Store it in a password manager: anyone with it can access your dashboard.</p>
        <pre id="apikey">${esc(apiKey)}</pre>
        <button class="btn sm ghost" onclick="navigator.clipboard.writeText(document.getElementById('apikey').textContent);this.textContent='Copied'">Copy key</button>
      </div>
      <div class="card" style="margin-top:16px">
        <b>Your collection link</b>
        <p class="muted" style="margin:6px 0 10px">Share this with customers to gather testimonials.</p>
        <pre>${esc(base)}/c/${esc(slug)}</pre>
      </div>
      <div style="height:18px"></div>
      ${checkout}
    </div>`,
    { nav: false },
  );
}

export function apiKeyResetPage(apiKey: string): string {
  return layout(
    "API key reset: ProofClip",
    `<div class="wrap" style="max-width:620px">
      <span class="eyebrow"><span class="dot"></span><span class="pill">API key reset</span></span>
      <h1 style="font-size:36px;letter-spacing:-1px">Your new key is ready.</h1>
      <div class="card" style="border-color:rgba(251,191,36,.4)">
        <b>Save this API key now</b>
        <p class="muted" style="margin:6px 0 10px">The old key no longer works. This new key is shown once, and your current browser session has already been updated.</p>
        <pre id="apikey">${esc(apiKey)}</pre>
        <button class="btn sm ghost" onclick="navigator.clipboard.writeText(document.getElementById('apikey').textContent);this.textContent='Copied'">Copy key</button>
      </div>
      <div style="height:18px"></div>
      <a class="btn" href="/app">Back to dashboard</a>
    </div>`,
    { nav: false },
  );
}
