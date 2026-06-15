import type { PlanId } from "./types";

export interface PlanLimits {
  id: PlanId;
  label: string;
  price: number; // USD / month
  maxSpaces: number;
  maxTestimonials: number; // per space; Infinity = unlimited
  maxWidgets: number; // per space
  canRemoveBranding: boolean;
  canUseCards: boolean;
  canCustomDomain: boolean;
  whiteLabel: boolean;
}

export const PLANS: Record<PlanId, PlanLimits> = {
  free: {
    id: "free",
    label: "Free",
    price: 0,
    maxSpaces: 1,
    maxTestimonials: 10,
    maxWidgets: 1,
    canRemoveBranding: false,
    canUseCards: false,
    canCustomDomain: false,
    whiteLabel: false,
  },
  starter: {
    id: "starter",
    label: "Starter",
    price: 19,
    maxSpaces: 1,
    maxTestimonials: 100,
    maxWidgets: 3,
    canRemoveBranding: true,
    canUseCards: false,
    canCustomDomain: false,
    whiteLabel: false,
  },
  pro: {
    id: "pro",
    label: "Pro",
    price: 39,
    maxSpaces: 3,
    maxTestimonials: Infinity,
    maxWidgets: Infinity,
    canRemoveBranding: true,
    canUseCards: true,
    canCustomDomain: true,
    whiteLabel: false,
  },
  agency: {
    id: "agency",
    label: "Agency",
    price: 79,
    maxSpaces: 10,
    maxTestimonials: Infinity,
    maxWidgets: Infinity,
    canRemoveBranding: true,
    canUseCards: true,
    canCustomDomain: true,
    whiteLabel: true,
  },
};

export function planFor(id: string): PlanLimits {
  return PLANS[(id as PlanId)] ?? PLANS.free;
}
