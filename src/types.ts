export interface Env {
  DB: D1Database;
  MEDIA: R2Bucket;
  PUBLIC_BASE_URL: string;
  CHECKOUT_STARTER_URL?: string;
  CHECKOUT_PRO_URL?: string;
  CHECKOUT_AGENCY_URL?: string;
  BILLING_WEBHOOK_SECRET?: string;
}

export interface Account {
  id: string;
  email: string;
  api_key: string;
  plan: PlanId;
  created_at: number;
}

export interface Space {
  id: string;
  account_id: string;
  slug: string;
  name: string;
  accent: string;
  logo_url: string | null;
  branding: number;
  created_at: number;
}

export interface Testimonial {
  id: string;
  space_id: string;
  source: string;
  name: string | null;
  handle: string | null;
  company: string | null;
  avatar_url: string | null;
  rating: number | null;
  text: string | null;
  image_url: string | null;
  status: "pending" | "approved" | "hidden";
  permission: number;
  created_at: number;
}

export type PlanId = "free" | "starter" | "pro" | "agency";
