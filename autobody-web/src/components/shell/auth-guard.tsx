"use client";

import { useEffect } from "react";
import { getAccessToken } from "@/lib/auth";

// Demo mode: getAccessToken auto-bootstraps a session, so we never redirect.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Touch storage to seed the demo session on first paint.
    getAccessToken();
  }, []);

  return <>{children}</>;
}
