import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        sidebar: "var(--sidebar)",
        "sidebar-foreground": "var(--sidebar-foreground)",
        "sidebar-primary": "var(--sidebar-primary)",
        "sidebar-primary-foreground": "var(--sidebar-primary-foreground)",
        "sidebar-accent": "var(--sidebar-accent)",
        "sidebar-accent-foreground": "var(--sidebar-accent-foreground)",
        "sidebar-border": "var(--sidebar-border)",
        "sidebar-ring": "var(--sidebar-ring)",
        success: "var(--success)",
        warning: "var(--warning)",
        "chart-1": "var(--chart-1)",
        "chart-2": "var(--chart-2)",
        "chart-3": "var(--chart-3)",
        "chart-4": "var(--chart-4)",
        "chart-5": "var(--chart-5)",
        // Marketing — cool dark automotive palette
        midnight: {
          950: "#070d14",
          900: "#0b1622",
          800: "#0f1d2c",
          700: "#152938",
          600: "#1c3445",
          500: "#23415a",
          400: "#3a5d7a",
          300: "#5b7f9d",
        },
        steel: {
          50: "#f4f7fa",
          100: "#dde6ef",
          200: "#b5c4d3",
          300: "#8da1b5",
          400: "#6b8094",
        },
        // Claude warm palette
        cream: {
          50: "#FAF7F2",
          100: "#F5EFE6",
          200: "#EDE4D3",
          300: "#E5DED4",
          400: "#D9CEBB",
        },
        ink: {
          900: "#262220",
          800: "#3D3929",
          700: "#5C554A",
          600: "#87796F",
          500: "#A89D90",
          400: "#C4BBAF",
        },
        clay: {
          50: "#FCF1EC",
          100: "#F5D9CD",
          300: "#E0916E",
          500: "#C96442",
          600: "#B25638",
          700: "#8C3F28",
        },
        leaf: {
          50: "#EEF2E7",
          500: "#5A7C3C",
          600: "#466230",
        },
        amber: {
          50: "#FDF4DE",
          500: "#C49A3F",
          600: "#9D7A2D",
        },
        rust: {
          50: "#FBE7E2",
          500: "#B53D2E",
          600: "#8E2E22",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        display: ["var(--font-display)", "Impact", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["3.25rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display-md": ["2rem", { lineHeight: "1.15", letterSpacing: "-0.015em" }],
        "display-sm": ["1.5rem", { lineHeight: "1.25", letterSpacing: "-0.01em" }],
      },
      borderRadius: {
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.875rem",
        xl: "1.125rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(61, 57, 41, 0.04), 0 2px 8px rgba(61, 57, 41, 0.04)",
        card: "0 1px 2px rgba(61, 57, 41, 0.05), 0 4px 16px rgba(61, 57, 41, 0.05)",
        pop: "0 4px 12px rgba(61, 57, 41, 0.08), 0 12px 32px rgba(61, 57, 41, 0.08)",
        bezel:
          "inset 0 0 0 1px rgba(255,255,255,0.04), 0 24px 48px -12px rgba(0,0,0,0.55), 0 2px 0 rgba(255,255,255,0.03)",
        glass:
          "inset 0 0 0 1px rgba(255,255,255,0.08), 0 8px 24px -8px rgba(0,0,0,0.5)",
      },
      backgroundImage: {
        "midnight-radial":
          "radial-gradient(ellipse at 80% 20%, rgba(58, 93, 122, 0.25) 0%, rgba(11, 22, 34, 0) 60%), radial-gradient(ellipse at 10% 80%, rgba(35, 65, 90, 0.3) 0%, rgba(11, 22, 34, 0) 55%), linear-gradient(180deg, #0b1622 0%, #070d14 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
