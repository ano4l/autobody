import type { ComponentType, SVGProps } from "react";
import type { Route } from "next";
import {
  IconBox,
  IconChart,
  IconChat,
  IconDashboard,
  IconFlag,
  IconMegaphone,
  IconReceipt,
  IconReceiptStack,
  IconRegister,
  IconTruck,
  IconUsers,
} from "@/components/ui/icons";

export interface NavItem {
  href: Route;
  label: string;
  shortLabel: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

export const commerceNav: NavItem[] = [
  { href: "/dashboard", label: "Overview", shortLabel: "Home", icon: IconDashboard },
  { href: "/inventory", label: "Inventory", shortLabel: "Stock", icon: IconBox },
  { href: "/suppliers", label: "Suppliers", shortLabel: "Supply", icon: IconTruck },
  { href: "/orders", label: "Orders", shortLabel: "Orders", icon: IconReceipt },
  { href: "/receipts", label: "Receipts", shortLabel: "Receipts", icon: IconReceiptStack },
  { href: "/conversations", label: "Conversations", shortLabel: "Inbox", icon: IconChat },
  { href: "/escalations", label: "Escalations", shortLabel: "Flags", icon: IconFlag },
  { href: "/pos", label: "Point of Sale", shortLabel: "POS", icon: IconRegister },
  { href: "/broadcast" as Route, label: "Broadcast", shortLabel: "Broadcast", icon: IconMegaphone },
  { href: "/reports", label: "Reports", shortLabel: "Reports", icon: IconChart },
  { href: "/users", label: "Users", shortLabel: "Users", icon: IconUsers },
];

export const mobileNav: NavItem[] = commerceNav.filter((item) =>
  ["/dashboard", "/inventory", "/orders", "/receipts", "/pos"].includes(item.href),
);
