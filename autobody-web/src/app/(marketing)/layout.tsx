import type { ReactNode } from "react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { CartDrawer } from "@/components/marketing/cart-drawer";
import { SmoothScrollProvider } from "@/components/marketing/smooth-scroll-provider";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <SmoothScrollProvider>
      <div className="min-h-screen bg-[#f4f5f9] text-[#1a1d25]">
        <div className="fixed left-0 top-0 z-[70] h-[3px] w-full origin-left scale-x-[var(--scroll-progress,0)] bg-[#2e4de0]" />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <CartDrawer />
      </div>
    </SmoothScrollProvider>
  );
}
