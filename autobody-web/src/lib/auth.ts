"use client";

import type { AuthUser, LoginResponse } from "./types";

const ACCESS_KEY = "ab_access";
const REFRESH_KEY = "ab_refresh";
const USER_KEY = "ab_user";

// Demo / fake auth — let any visitor through without a real backend handshake.
const DEMO_TOKEN = "demo-access-token";
const DEMO_USER: AuthUser = {
  id: 1,
  email: "demo@ferreiras.local",
  name: "Demo Admin",
  role: "ADMIN",
  active: true,
};

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

// In demo mode we always present a token + user so AuthGuard never redirects.
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return DEMO_TOKEN;
  const stored = localStorage.getItem(ACCESS_KEY);
  if (stored) return stored;
  // Auto-bootstrap a demo session so first-time visitors aren't bounced.
  saveSession(makeDemoSession());
  return DEMO_TOKEN;
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY) ?? `${DEMO_TOKEN}-refresh`;
}

export function getCurrentUser(): AuthUser | null {
  if (typeof window === "undefined") return DEMO_USER;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return DEMO_USER;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return DEMO_USER;
  }
}
