"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getAccessToken, isDemoMode } from "@/lib/auth";

// Inner component that calls useSearchParams — must be inside <Suspense>.
function AuthGuardInner({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [allow, setAllow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = getAccessToken();
    if (token) {
      setAllow(true);
      return;
    }
    if (isDemoMode()) {
      setAllow(true);
      return;
    }
    const next = `${pathname ?? "/dashboard"}${params?.toString() ? `?${params.toString()}` : ""}`;
    router.replace(`/login?next=${encodeURIComponent(next)}`);
  }, [pathname, params, router]);

  if (!allow) return null;
  return <>{children}</>;
}

// Auth guard for the dashboard route group.
//
// Demo mode (default): getAccessToken() auto-bootstraps a synthetic session,
// so we never redirect.
//
// Real mode (NEXT_PUBLIC_AUTH_MODE=real): if no token is in localStorage we
// punt to /login?next=<current path> so the login page can return us here.
// We render nothing while we're deciding to avoid flashing protected UI.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AuthGuardInner>{children}</AuthGuardInner>
    </Suspense>
  );
}
