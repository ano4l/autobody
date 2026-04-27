"use client";

import type { AuthUser, LoginResponse } from "./types";

const ACCESS_KEY = "ab_access";
const REFRESH_KEY = "ab_refresh";
const USER_KEY = "ab_user";

// Demo / fake auth — used when NEXT_PUBLIC_AUTH_MODE !== "real".
// In demo mode any credentials succeed and a synthetic session is stored
// locally so the app works offline / without the Spring backend.
const DEMO_TOKEN = "demo-access-token";
const DEMO_USER: AuthUser = {
  id: 1,
  email: "demo@ferreiras.local",
  name: "Demo Admin",
  role: "ADMIN",
  active: true,
};

// Auth mode toggle. Default is "demo" so the storefront + dashboard work without
// a backend running; flip NEXT_PUBLIC_AUTH_MODE=real (e.g. in `.env.local`) to
// require a successful POST /api/auth/login round-trip.
export function isDemoMode(): boolean {
  const mode = process.env.NEXT_PUBLIC_AUTH_MODE;
  return mode !== "real";
}

export function makeDemoSession(overrides?: Partial<AuthUser>): LoginResponse {
  return {
    accessToken: DEMO_TOKEN,
    refreshToken: `${DEMO_TOKEN}-refresh`,
    expiresInMs: 1000 * 60 * 60 * 24 * 30,
    user: { ...DEMO_USER, ...overrides },
  };
}

export function saveSession(r: LoginResponse) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACCESS_KEY, r.accessToken);
  localStorage.setItem(REFRESH_KEY, r.refreshToken);
  localStorage.setItem(USER_KEY, JSON.stringify(r.user));
  document.cookie = `ab_access=${r.accessToken}; path=/; max-age=${Math.floor(r.expiresInMs / 1000)}; SameSite=Lax`;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  document.cookie = "ab_access=; path=/; max-age=0";
}

// In demo mode getAccessToken() auto-bootstraps a session so the AuthGuard
// never bounces. In real mode we only return a stored token (or null) and let
// the guard redirect to /login when missing.
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return isDemoMode() ? DEMO_TOKEN : null;
  const stored = localStorage.getItem(ACCESS_KEY);
  if (stored) return stored;
  if (!isDemoMode()) return null;
  saveSession(makeDemoSession());
  return DEMO_TOKEN;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(REFRESH_KEY);
  if (stored) return stored;
  return isDemoMode() ? `${DEMO_TOKEN}-refresh` : null;
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return isDemoMode() ? DEMO_USER : null;
  const raw = localStorage.getItem(USER_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as AuthUser;
    } catch {
      // fall through
    }
  }
  return isDemoMode() ? DEMO_USER : null;
}

export function hasSession(): boolean {
  if (typeof window === "undefined") return isDemoMode();
  return !!localStorage.getItem(ACCESS_KEY) || isDemoMode();
}

// Hard navigate to /login, preserving the current path + query as ?next=.
// Used by data-loading callers when the backend reports the session is gone
// (HTTP 401 after a failed refresh).
export function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const here = window.location.pathname + window.location.search;
  const next = encodeURIComponent(here || "/dashboard");
  window.location.href = `/login?next=${next}`;
}
