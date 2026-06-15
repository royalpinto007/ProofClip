import type { Account, Env, Space, Testimonial } from "./types";

export async function getAccountByKey(
  env: Env,
  apiKey: string,
): Promise<Account | null> {
  if (!apiKey) return null;
  return env.DB.prepare("SELECT * FROM accounts WHERE api_key = ?")
    .bind(apiKey)
    .first<Account>();
}

export async function getAccountByEmail(
  env: Env,
  email: string,
): Promise<Account | null> {
  return env.DB.prepare("SELECT * FROM accounts WHERE email = ?")
    .bind(email.toLowerCase())
    .first<Account>();
}

export async function getSpaceBySlug(
  env: Env,
  slug: string,
): Promise<Space | null> {
  return env.DB.prepare("SELECT * FROM spaces WHERE slug = ?")
    .bind(slug)
    .first<Space>();
}

export async function getSpaceById(
  env: Env,
  id: string,
): Promise<Space | null> {
  return env.DB.prepare("SELECT * FROM spaces WHERE id = ?")
    .bind(id)
    .first<Space>();
}

export async function spacesForAccount(
  env: Env,
  accountId: string,
): Promise<Space[]> {
  const r = await env.DB.prepare(
    "SELECT * FROM spaces WHERE account_id = ? ORDER BY created_at DESC",
  )
    .bind(accountId)
    .all<Space>();
  return r.results ?? [];
}

export async function testimonialsForSpace(
  env: Env,
  spaceId: string,
  status?: string,
): Promise<Testimonial[]> {
  const q = status
    ? env.DB.prepare(
        "SELECT * FROM testimonials WHERE space_id = ? AND status = ? ORDER BY created_at DESC",
      ).bind(spaceId, status)
    : env.DB.prepare(
        "SELECT * FROM testimonials WHERE space_id = ? ORDER BY created_at DESC",
      ).bind(spaceId);
  const r = await q.all<Testimonial>();
  return r.results ?? [];
}

export async function countTestimonials(
  env: Env,
  spaceId: string,
): Promise<number> {
  const r = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM testimonials WHERE space_id = ?",
  )
    .bind(spaceId)
    .first<{ n: number }>();
  return r?.n ?? 0;
}

export async function countWidgets(env: Env, spaceId: string): Promise<number> {
  const r = await env.DB.prepare(
    "SELECT COUNT(*) AS n FROM widgets WHERE space_id = ?",
  )
    .bind(spaceId)
    .first<{ n: number }>();
  return r?.n ?? 0;
}
