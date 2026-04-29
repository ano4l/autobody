import type { Metadata, Viewport } from "next";
import { Inter, Orbitron } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
  display: "swap",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ferreiras-autobody.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ferreira's Autobody Spares",
    template: "%s · Ferreira's Autobody Spares",
  },
  description:
    "Used and new autobody spares for South African workshops — bumpers, headlights, brakes, panels, fitment-checked and dispatched nationwide.",
  applicationName: "Ferreira's Autobody",
  keywords: [
    "autobody spares",
    "panel beater parts",
    "autobody parts",
    "vehicle spares",
    "OEM aftermarket South Africa",
    "Pretoria autobody",
    "WhatsApp parts quote",
  ],
  authors: [{ name: "Ferreira's Autobody Spares" }],
  openGraph: {
    type: "website",
    siteName: "Ferreira's Autobody Spares",
    title: "Ferreira's Autobody Spares — parts, fitment, done right.",
    description:
      "Quote-assisted ordering for OEM, aftermarket, and used vehicle parts. Pretoria workshop, nationwide delivery.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Ferreira's Autobody Spares",
    description: "Parts. Fitment. Done right.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f9" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1016" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://player.vimeo.com" />
        <link rel="preconnect" href="https://i.vimeocdn.com" />
        <link rel="preconnect" href="https://f.vimeocdn.com" />
        <link rel="dns-prefetch" href="https://player.vimeo.com" />
      </head>
      <body>{children}</body>
    </html>
  );
}
