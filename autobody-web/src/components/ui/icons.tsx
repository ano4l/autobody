import * as React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const IconDashboard = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const IconBox = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M21 8.5 12 3 3 8.5v7L12 21l9-5.5v-7Z" />
    <path d="M3 8.5 12 14l9-5.5" />
    <path d="M12 14v7" />
  </svg>
);

export const IconChat = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 5h16v11H8l-4 4V5Z" />
  </svg>
);

export const IconReceipt = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 3h14v18l-3-2-3 2-3-2-3 2V3Z" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);

export const IconFlag = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 21V4h11l-1.5 3 1.5 3H5" />
  </svg>
);

export const IconRegister = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18M8 15h2M14 15h2" />
  </svg>
);

export const IconChart = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 20V6M10 20V10M16 20v-6M22 20H2" />
  </svg>
);

export const IconSearch = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const IconPlus = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconLogout = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" />
    <path d="M10 17l-5-5 5-5M5 12h12" />
  </svg>
);

export const IconAlert = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3 2 20h20L12 3Z" />
    <path d="M12 10v4M12 17h.01" />
  </svg>
);

export const IconArrowUp = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

export const IconArrowDown = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);

export const IconTruck = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z" />
    <circle cx="7" cy="18" r="2" />
    <circle cx="17" cy="18" r="2" />
  </svg>
);

export const IconUsers = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="8" r="4" />
    <path d="M2 21a7 7 0 0 1 14 0" />
    <path d="M17 11a3 3 0 1 0 0-6" />
    <path d="M22 21a5 5 0 0 0-3-4.58" />
  </svg>
);

export const IconArrowLeft = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const IconSpark = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

export const IconReceiptStack = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M7 3h11v14l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4V3Z" />
    <path d="M5 7H4a1 1 0 0 0-1 1v13l2-1.4 2 1.4 2-1.4 2 1.4 2-1.4" />
    <path d="M10 7h5M10 10h5M10 13h3" />
  </svg>
);

export const IconClock = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

export const IconWallet = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" />
    <path d="M4 9h16" />
    <path d="M16 14h2" />
  </svg>
);

export const IconChevronRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const IconMegaphone = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 11v2a2 2 0 0 0 2 2h2l4 4V5l-4 4H6a2 2 0 0 0-2 2Z" />
    <path d="M16 9a4 4 0 0 1 0 6" />
    <path d="M18.5 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);
