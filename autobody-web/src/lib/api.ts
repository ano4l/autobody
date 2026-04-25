"use client";

import { clearSession, getAccessToken, getRefreshToken, saveSession } from "./auth";
import type { ApiEnvelope, LoginResponse } from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (typeof window !== "undefined" ? "/backend" : "http://localhost:8080");

export class ApiError extends Error {
  constructor(public status: number, public code: string | undefined, message: string) {
    super(message);
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  auth?: boolean;
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(path: string, query?: RequestOptions["query"]) {
  const url = new URL(path.startsWith("http") ? path : `${BASE_URL}${path}`, typeof window === "undefined" ? "http://localhost" : window.location.origin);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

let refreshing: Promise<string | null> | null = null;

async function attemptRefresh(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  if (refreshing) return refreshing;
  refreshing = (async () => {
    try {
      const res = await fetch(buildUrl("/api/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (!res.ok) {
        clearSession();
        return null;
      }
      const envelope = (await res.json()) as ApiEnvelope<LoginResponse>;
      if (envelope.success && envelope.data) {
        saveSession(envelope.data);
        return envelope.data.accessToken;
      }
      clearSession();
      return null;
    } catch {
      clearSession();
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

async function request<T>(method: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const { body, auth = true, query, headers, ...init } = opts;
  const doFetch = async (token: string | null) => {
    const finalHeaders: Record<string, string> = {
      Accept: "application/json",
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...((headers as Record<string, string>) ?? {}),
    };
    return fetch(buildUrl(path, query), {
      method,
      ...init,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  };

  let token = auth ? getAccessToken() : null;
  let res = await doFetch(token);
  if (res.status === 401 && auth) {
    const newToken = await attemptRefresh();
    if (newToken) {
      token = newToken;
      res = await doFetch(newToken);
    }
  }

  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    if (!res.ok) throw new ApiError(res.status, undefined, res.statusText || "Request failed");
    return undefined as T;
  }

  const envelope = (await res.json()) as ApiEnvelope<T>;
  if (!res.ok || envelope.success === false) {
    throw new ApiError(
      res.status,
      envelope.error,
      envelope.message ?? envelope.error ?? `Request failed (${res.status})`,
    );
  }
  return envelope.data;
}

export const api = {
  get: <T,>(path: string, opts?: RequestOptions) => request<T>("GET", path, opts),
  post: <T,>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("POST", path, { ...opts, body }),
  put: <T,>(path: string, body?: unknown, opts?: RequestOptions) => request<T>("PUT", path, { ...opts, body }),
  del: <T,>(path: string, opts?: RequestOptions) => request<T>("DELETE", path, opts),
  raw: request,
};
