import Link from "next/link";

function FooterCol({ title, items }: { title: string; items: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#2e4de0]">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-white/60">
        {items.map((item) => (
          <li key={item.label}>
            <Link href={item.href as "/"} className="transition-colors hover:text-white">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer id="footer" className="bg-[#0d1016] text-white">
      <div className="mx-auto max-w-[1400px] px-5 py-16 lg:px-8">
        <div className="grid gap-9 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center bg-[#2e4de0] font-display text-xs text-white">
                FS
              </span>
              <span className="font-display text-xl">
                Ferreira&apos;s<span className="text-[#2e4de0]">.</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-7 text-white/60">
              New and used autobody spares for collision repair, restoration, workshop supply, and
              everyday maintenance. Since 2009.
            </p>
            <div className="mt-5 flex items-center gap-3 text-xs text-white/50">
              <span>FB</span>
              <span>IG</span>
              <span>TikTok</span>
              <span>WhatsApp</span>
            </div>
          </div>
          <FooterCol
            title="Contact"
            items={[
              { label: "012 943 7437", href: "tel:0129437437" },
              { label: "WhatsApp 074 194 5672", href: "tel:0741945672" },
              { label: "ferreirasautobodyparts@gmail.com", href: "mailto:ferreirasautobodyparts@gmail.com" },
              { label: "Pretoria, Gauteng", href: "/contact" },
            ]}
          />
          <FooterCol
            title="Shop"
            items={[
              { label: "Full Catalog", href: "/shop" },
              { label: "Bumpers", href: "/shop?category=Bumpers" },
              { label: "Headlights", href: "/shop?category=Headlights" },
              { label: "Wheels", href: "/shop?category=Wheels" },
              { label: "Brakes", href: "/shop?category=Brakes" },
            ]}
          />
          <FooterCol
            title="Company"
            items={[
              { label: "About Us", href: "/about" },
              { label: "Services", href: "/services" },
              { label: "Contact", href: "/contact" },
              { label: "Cart", href: "/cart" },
              { label: "Checkout", href: "/checkout" },
            ]}
          />
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-[10px] uppercase tracking-[0.2em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Ferreira&apos;s Autobody Spares</span>
          <span>Since 2009 / Gauteng & nationwide delivery</span>
        </div>
      </div>
    </footer>
  );
}
