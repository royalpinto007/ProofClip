import { PLANS } from "./plans";
import { esc } from "./util";

const STYLE = `
:root{--bg:#08080c;--panel:rgba(255,255,255,.035);--panel2:rgba(255,255,255,.06);--line:rgba(255,255,255,.09);--text:#edecf5;--muted:#9c9cb4;--accent:#6366f1;--accent2:#a855f7;--good:#34d399;--warn:#fbbf24;--maxw:1200px}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.6 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;overflow-x:hidden}
/* animated gradient field behind everything */
body::before{content:"";position:fixed;inset:-20%;z-index:-2;background:
  radial-gradient(45% 45% at 18% 12%,rgba(99,102,241,.22),transparent 60%),
  radial-gradient(40% 40% at 85% 18%,rgba(168,85,247,.20),transparent 60%),
  radial-gradient(50% 50% at 60% 95%,rgba(99,102,241,.16),transparent 60%);
  animation:drift 22s ease-in-out infinite alternate;filter:blur(8px)}
body::after{content:"";position:fixed;inset:0;z-index:-1;background-image:linear-gradient(rgba(255,255,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.025) 1px,transparent 1px);background-size:46px 46px;mask:radial-gradient(circle at 50% 30%,#000,transparent 75%)}
@keyframes drift{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-3%,2%,0) scale(1.06)}100%{transform:translate3d(3%,-2%,0) scale(1.02)}}
a{color:var(--accent2);text-decoration:none}a:hover{text-decoration:underline}
.wrap{max-width:var(--maxw);margin:0 auto;padding:32px 28px}
.nav{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 28px;border-bottom:1px solid var(--line);background:rgba(8,8,12,.6);backdrop-filter:blur(14px)}
.brand{font-weight:800;font-size:19px;letter-spacing:-.3px;background:linear-gradient(90deg,var(--accent),var(--accent2));-webkit-background-clip:text;background-clip:text;color:transparent}
.btn{display:inline-block;background:linear-gradient(90deg,var(--accent),var(--accent2));color:#fff;border:0;border-radius:11px;padding:11px 18px;font-weight:600;cursor:pointer;font-size:14px;transition:transform .15s ease,box-shadow .25s ease,opacity .2s;box-shadow:0 6px 18px -8px rgba(124,93,250,.8)}
.btn:hover{transform:translateY(-2px);box-shadow:0 12px 28px -10px rgba(124,93,250,.95);text-decoration:none}
.btn:active{transform:translateY(0)}
.btn.ghost{background:rgba(255,255,255,.04);border:1px solid var(--line);color:var(--text);box-shadow:none}
.btn.ghost:hover{background:rgba(255,255,255,.08)}
.btn.sm{padding:7px 12px;font-size:13px;border-radius:9px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:22px;backdrop-filter:blur(10px);transition:transform .2s ease,border-color .2s ease,background .2s ease}
.card:hover{transform:translateY(-4px);border-color:rgba(168,85,247,.45);background:var(--panel2)}
.grid{display:grid;gap:18px}
.cols-2{grid-template-columns:repeat(auto-fit,minmax(300px,1fr))}
.cols-3{grid-template-columns:repeat(auto-fit,minmax(250px,1fr))}
.cols-4{grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
input,textarea,select{width:100%;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:11px;color:var(--text);padding:11px 13px;font:inherit;transition:border-color .15s,box-shadow .15s}
input:focus,textarea:focus,select:focus{outline:0;border-color:var(--accent);box-shadow:0 0 0 3px rgba(99,102,241,.25)}
label{display:block;font-size:13px;color:var(--muted);margin:12px 0 4px}
.muted{color:var(--muted)}
.hero{padding:84px 0 48px;text-align:center;position:relative}
.hero h1{font-size:clamp(34px,6vw,62px);line-height:1.05;margin:0 auto 18px;max-width:14ch;letter-spacing:-1.5px;font-weight:800}
.g{background:linear-gradient(100deg,#fff 10%,var(--accent2) 55%,var(--accent) 100%);-webkit-background-clip:text;background-clip:text;color:transparent}
.hero p{font-size:clamp(16px,2vw,20px);color:var(--muted);max-width:620px;margin:0 auto 28px}
.pill{display:inline-block;font-size:12px;border:1px solid var(--line);border-radius:999px;padding:5px 13px;color:var(--muted);background:rgba(255,255,255,.03)}
.eyebrow{display:inline-flex;align-items:center;gap:8px;margin-bottom:20px}
.eyebrow .dot{width:7px;height:7px;border-radius:50%;background:var(--good);box-shadow:0 0 0 0 rgba(52,211,153,.6);animation:pulse 2s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(52,211,153,.5)}70%{box-shadow:0 0 0 8px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)}}
.section{padding:56px 0}
.section h2{font-size:clamp(26px,4vw,38px);letter-spacing:-.8px;margin:0 0 8px;font-weight:800}
.lead{color:var(--muted);max-width:560px;margin:0 0 28px}
.stars{color:var(--warn);letter-spacing:2px}
.t{border:1px solid var(--line);border-radius:16px;padding:18px;background:var(--panel);backdrop-filter:blur(8px);transition:transform .2s,border-color .2s}
.t:hover{transform:translateY(-3px);border-color:rgba(168,85,247,.4)}
.t .who{display:flex;align-items:center;gap:10px;margin-top:12px}
.t .who img{width:36px;height:36px;border-radius:50%;object-fit:cover;background:var(--panel2)}
.tag{font-size:11px;padding:2px 8px;border-radius:6px;border:1px solid var(--line);color:var(--muted)}
.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.right{margin-left:auto}
table{width:100%;border-collapse:collapse}
th,td{text-align:left;padding:10px;border-bottom:1px solid var(--line);font-size:14px;vertical-align:top}
code,pre{font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
pre{background:rgba(0,0,0,.35);border:1px solid var(--line);border-radius:12px;padding:14px;overflow:auto;font-size:13px}
.foot{color:var(--muted);font-size:12px;text-align:center;padding:40px 0;border-top:1px solid var(--line);margin-top:40px}
.price{font-size:34px;font-weight:800;letter-spacing:-1px}
.plan-pop{position:relative;border-color:rgba(168,85,247,.5);box-shadow:0 20px 60px -30px rgba(168,85,247,.8)}
.plan-pop::after{content:"Popular";position:absolute;top:-11px;right:18px;font-size:11px;font-weight:700;color:#fff;background:linear-gradient(90deg,var(--accent),var(--accent2));padding:3px 10px;border-radius:999px}
/* scroll reveal */
.reveal{opacity:0;transform:translateY(24px);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1)}
.reveal.in{opacity:1;transform:none}
/* floating hero cards */
.float-stack{position:relative;height:360px;max-width:520px;margin:0 auto;perspective:1000px}
.float-stack .fc{position:absolute;width:300px;text-align:left;will-change:transform}
.float-stack .fc:nth-child(1){top:8px;left:50%;transform:translateX(-50%)}
.float-stack .fc:nth-child(2){top:120px;left:6%;animation:bob 6s ease-in-out infinite}
.float-stack .fc:nth-child(3){top:150px;right:2%;animation:bob 7s ease-in-out infinite .8s}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@media(max-width:760px){.float-stack{height:auto;display:grid;gap:14px;perspective:none}.float-stack .fc{position:static;width:auto;transform:none!important;animation:none}}
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
        <a class="btn ${p.id === "pro" ? "" : "ghost"}" style="width:100%;text-align:center" href="/signup">Choose ${esc(p.label)}</a>
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
      <div class="hero">
        <span class="eyebrow"><span class="dot"></span><span class="pill">Live &middot; built for creators &amp; small SaaS</span></span>
        <h1>Turn customer love into <span class="g">website proof</span> and viral content.</h1>
        <p>Collect testimonials, import review screenshots from anywhere, embed a wall of love, and turn each one into a share-ready social card. Free to start.</p>
        <div class="row" style="justify-content:center">
          <a class="btn" href="/signup">Start free</a>
          <a class="btn ghost" href="/demo">See a live wall &rarr;</a>
        </div>
      </div>

      <div class="float-stack reveal" style="margin-bottom:40px">
        ${fc("Set up our wall in ten minutes and the social cards got 3x our normal engagement.", "Maya", "Founder, Notionly", 5)}
        ${fc("Finally one place for every review screenshot. The embed just works.", "Dev", "@devbuilds", 5)}
        ${fc("Closed two deals after adding the wall to our pricing page.", "Sara", "Indie SaaS", 5)}
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
        <div class="reveal" style="display:flex;gap:28px;flex-wrap:wrap;align-items:center">
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
      <form method="post" action="/login">
        <label>API key</label>
        <input name="key" type="password" required placeholder="pk_..." autocomplete="current-password">
        <div style="height:14px"></div>
        <button class="btn" type="submit">Open dashboard</button>
      </form>
      <p class="muted" style="margin-top:14px">No account yet? <a href="/signup">Create one free</a></p>
    </div>`,
  );
}

export function keyIssuedPage(apiKey: string, slug: string, base: string): string {
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
      <a class="btn" href="/app">Go to dashboard &rarr;</a>
    </div>`,
    { nav: false },
  );
}
