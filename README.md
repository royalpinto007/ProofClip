# ProofClip

Testimonial wall + social-proof content generator for creators and small SaaS.

Collect testimonials with a shareable form, import review screenshots from
anywhere, embed a wall of love on your site, and turn any testimonial into a
share-ready social card (9:16 / 1:1 / 16:9).

Runs entirely on Cloudflare's free tier: Workers + D1 + R2.

## Features

- **Collect**: a public form per workspace (text, rating, photo, permission).
- **Import**: upload screenshots of DMs, comments and reviews.
- **Moderate**: approve / hide / delete from a simple dashboard.
- **Wall of love**: a public page of approved testimonials.
- **Embeddable widget**: one `<script>` tag, drops a masonry wall into any site.
- **Card generator**: client-side canvas, exports a PNG. No paid image API.
- **Analytics**: widget views and clicks per workspace.
- **Plans**: Free / Starter $19 / Pro $39 / Agency $79, with limits enforced.

## Stack

- Cloudflare Workers + [Hono](https://hono.dev) (API + server-rendered pages)
- D1 (SQLite) for relational data
- R2 for uploaded images
- No build step for client assets; widget + card JS are served as strings.

## Local development

```bash
npm install
npm run db:init:local          # create tables in local D1
npm run dev                    # http://localhost:8787
```

Walk the flow: open `/signup`, save the API key, open the collection link
(`/c/<slug>`), submit a testimonial, approve it in `/app`, then view
the wall at `/w/<slug>` and the embed at `/widget.js`.

## Deploy

1. Create the D1 database and put its id in `wrangler.jsonc`:
   ```bash
   npx wrangler d1 create proofclip
   npm run db:init:remote
   ```
2. Create the R2 bucket:
   ```bash
   npx wrangler r2 bucket create proofclip-media
   ```
3. Set `PUBLIC_BASE_URL` in `wrangler.jsonc` to your deployed URL (used by the
   widget, media links and cards).
4. Deploy:
   ```bash
   npm run deploy
   ```

## Routes

| Route | Purpose |
|---|---|
| `GET /` | Landing + pricing |
| `GET/POST /signup` | Create account, issue API key |
| `GET /login`, `GET /app` | Dashboard (auth by secure session cookie) |
| `GET /checkout/:plan` | Redirect logged-in users to a configured checkout link |
| `POST /api/billing/activate` | Protected webhook to flip `accounts.plan` |
| `GET /demo` | Live sample wall |
| `GET/POST /c/:slug` | Public collection form + submit |
| `GET /w/:slug` | Public wall of love |
| `POST /app/import` | Import a screenshot/text |
| `POST /app/testimonial/:action` | approve / hide / delete |
| `POST /app/settings` | Branding (name, accent, logo, branding toggle) |
| `GET /app/card` | Card studio (Pro+) |
| `GET /api/wall/:slug` | Widget JSON |
| `POST /api/event` | Record view/click |
| `GET /widget.js`, `/card.js` | Client assets |
| `GET /media/:name` | Serve uploaded images |

## Plan gating

Limits live in `src/plans.ts` and are enforced server-side: testimonial counts
(collection + import), widget counts, branding removal, custom domain, white
label, and the card generator (Pro+).

## Billing

`accounts.plan` is the single source of truth. Configure hosted payment links
as Worker vars:

- `CHECKOUT_STARTER_URL`
- `CHECKOUT_PRO_URL`
- `CHECKOUT_AGENCY_URL`

Set `BILLING_WEBHOOK_SECRET` as a Worker secret. Your payment provider or
automation can then call:

```bash
curl -X POST "$PUBLIC_BASE_URL/api/billing/activate" \
  -H "content-type: application/json" \
  -H "x-proofclip-secret: $BILLING_WEBHOOK_SECRET" \
  -d '{"email":"customer@example.com","plan":"pro"}'
```

You can also send `account_id` or `client_reference_id`; checkout links receive
both the account id and prefilled email as query params where providers support
them.

For Gumroad, create three products whose name, permalink, or variant contains
`ProofClip Starter`, `ProofClip Pro`, or `ProofClip Agency`. Then point Gumroad
sale pings at:

```text
$PUBLIC_BASE_URL/api/billing/gumroad?secret=$BILLING_WEBHOOK_SECRET
```

The Gumroad route accepts Gumroad's form-encoded sale payload, infers the plan
from product/variant fields, and upgrades the ProofClip account matching the
buyer email.

## Not yet built (paid-tier roadmap)

Video testimonials, custom domains wiring, team seats, provider-specific
webhook signature verification, and multiple widget configs. The data model
already supports them.
