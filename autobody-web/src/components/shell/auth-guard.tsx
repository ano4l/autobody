"use client";

import { useEffect, useState } from "react";
import { getAccessToken } from "@/lib/auth";

// Demo mode: getAccessToken auto-bootstraps a session, so we never redirect.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Touch storage to seed the demo session on first paint, then unblock.
    getAccessToken();
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-400 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
