import { AuthGuard } from "@/components/shell/auth-guard";

// Dashboard pages own their own chrome. The layout just enforces (fake) auth.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
