"use client";

// Deterministic autobody demo data for the dashboard.
// No backend, no randomness across reloads.

export interface DashboardStats {
  todaySalesTotal: number;
  todayOrderCount: number;
  pendingOrderCount: number;
  openConversationCount: number;
  escalatedConversationCount: number;
  lowStockCount: number;
}

export interface Order {
  id: number;
  customerName: string | null;
  source: "WALK_IN" | "WHATSAPP" | "SHOPIFY" | "WEB";
  status: "PENDING" | "CONFIRMED" | "FULFILLED" | "CANCELLED" | "REFUNDED";
  total: number;
  items: string[];
  branch: string;
  createdAt: string;
}

export interface Conversation {
  id: number;
  customerName: string;
  channel: "WHATSAPP" | "SMS" | "EMAIL" | "PHONE";
  status: "OPEN" | "WAITING" | "ESCALATED" | "RESOLVED";
  message: string;
  vehicle?: string;
  assignedTo: string;
  updatedAt: string;
}

export interface DemoNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  relatedType: string | null;
  relatedId: number | null;
  createdAt: string;
}

export interface AuditEvent {
  id: number;
  action: string;
  actor: string;
  entity: string;
  entityId: number;
  details: string;
  createdAt: string;
}

export interface ReportsPayload {
  byBranch: { branch: string; revenue: number; orders: number }[];
  bySource: { source: string; count: number; revenue: number }[];
  byStatus: { status: string; count: number }[];
  byMonth: { month: string; revenue: number; orders: number }[];
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  fulfillmentRate: number;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20250425);
const randint = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];

const BRANCHES = ["Pretoria", "Johannesburg", "Cape Town", "Durban"] as const;
const SOURCES: Order["source"][] = ["WALK_IN", "WHATSAPP", "SHOPIFY", "WEB"];
const STATUSES: Order["status"][] = ["PENDING", "CONFIRMED", "FULFILLED", "CANCELLED", "REFUNDED"];
const NAMES = [
  "Mike's Panel Shop", "Sipho Auto Repairs", "Lerato Motors", "City Crash Centre",
  "Pretoria Bodyworks", "KZN Crash Repairs", "AutoFix Durban", "Cape Town Smash",
  null,
];
const PARTS = [
  "Front Bumper (Toyota Hilux)", "Headlight Assembly LH", "Brake Pad Set (Brembo)",
  "Alloy Wheel 17\" (Set)", "Radiator + Cooling Fan", "Suspension Strut (F)",
  "Bonnet Panel (VW Polo)", "Taillight Assembly RH", "Grille + Badge (Ford Ranger)",
  "Side Mirror (Electric)", "Windscreen + Rubbers", "Door Skin (BMW F30)",
];

// ── Stats ────────────────────────────────────────────────────────────────────
export function getDashboardStats(): Promise<DashboardStats> {
  return Promise.resolve({
    todaySalesTotal: 12450,
    todayOrderCount: 7,
    pendingOrderCount: 12,
    openConversationCount: 23,
    escalatedConversationCount: 3,
    lowStockCount: 5,
  });
}

// ── Orders ───────────────────────────────────────────────────────────────────
function makeOrders(count: number): Order[] {
  const out: Order[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const id = 1042 - i;
    const items: string[] = [];
    const itemCount = randint(1, 4);
    for (let j = 0; j < itemCount; j++) items.push(pick(PARTS));
    out.push({
      id,
      customerName: NAMES[i % NAMES.length],
      source: SOURCES[i % SOURCES.length],
      status: STATUSES[i % STATUSES.length],
      total: randint(450, 8900) + randint(0, 99),
      items,
      branch: BRANCHES[i % BRANCHES.length],
      createdAt: new Date(now - i * randint(2, 18) * 3600_000).toISOString(),
    });
  }
  return out;
}

const ORDERS = makeOrders(64);

export async function getOrders(status?: string, page = 1) {
  await delay();
  const all = !status || status === "all"
    ? ORDERS
    : ORDERS.filter((o) => o.status === status);
  const perPage = 10;
  const start = (page - 1) * perPage;
  return {
    data: all.slice(start, start + perPage),
    last_page: Math.max(1, Math.ceil(all.length / perPage)),
    total: all.length,
  };
}

export async function getRecentOrders(limit = 6): Promise<Order[]> {
  await delay();
  return ORDERS.slice(0, limit);
}

// ── Conversations ────────────────────────────────────────────────────────────
const CONVO_STATUS: Conversation["status"][] = ["OPEN", "WAITING", "ESCALATED", "RESOLVED"];
const CHANNELS: Conversation["channel"][] = ["WHATSAPP", "SMS", "EMAIL", "PHONE"];
const STAFF = ["Jan Ferreira", "Sipho Khumalo", "Lerato Mokoena", "Pieter van Zyl", "Nadia Patel"];
const VEHICLES = [
  "Toyota Hilux 2.4 GD-6", "VW Polo Vivo 1.4", "BMW 320i F30", "Mercedes C200 W205",
  "Ford Ranger XLT", "Hyundai i20", "Nissan NP200", "Kia Sportage", "Mazda CX-5",
];

function makeConversations(count: number): Conversation[] {
  const out: Conversation[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    out.push({
      id: i + 1,
      customerName: NAMES[i % NAMES.length] ?? "Unknown Customer",
      channel: CHANNELS[i % CHANNELS.length],
      status: CONVO_STATUS[i % CONVO_STATUS.length],
      message: [
        "Hi, do you have the front bumper for a Toyota Hilux in stock? Need it urgently.",
        "Can you quote me on headlight assemblies for a VW Polo? Need LH and RH.",
        "My order #1040 hasn't arrived yet. Can you check the tracking?",
        "Do you deliver to Durban? I need brake pads and rotors for a BMW F30.",
        "Price check on alloy wheel set 17 inch for Ford Ranger.",
        "Is the radiator for Mercedes W205 available? Need it by Friday.",
      ][i % 6],
      vehicle: pick(VEHICLES),
      assignedTo: STAFF[i % STAFF.length],
      updatedAt: new Date(now - i * randint(15, 180) * 60_000).toISOString(),
    });
  }
  return out;
}

const CONVERSATIONS = makeConversations(24);

export async function getConversations(status?: string, page = 1) {
  await delay();
  const all = !status || status === "all"
    ? CONVERSATIONS
    : CONVERSATIONS.filter((c) => c.status === status);
  const perPage = 8;
  const start = (page - 1) * perPage;
  return {
    data: all.slice(start, start + perPage),
    last_page: Math.max(1, Math.ceil(all.length / perPage)),
    total: all.length,
  };
}

// ── Notifications ──────────────────────────────────────────────────────────
function makeNotifications(): DemoNotification[] {
  const out: DemoNotification[] = [];
  const now = Date.now();
  const templates: { type: string; title: string; build: (arg?: any) => string }[] = [
    { type: "order", title: "New order received", build: (o: any) => `Order #${o.id} from ${o.customerName ?? "Walk-in"} for ZAR ${o.total.toLocaleString("en", { minimumFractionDigits: 2 })}.` },
    { type: "stock", title: "Low stock alert", build: () => `Item "${pick(PARTS)}" is running low at ${pick(BRANCHES)} branch.` },
    { type: "convo", title: "Escalated conversation", build: (c: any) => `Conversation with ${c.customerName} has been escalated.` },
    { type: "fulfilment", title: "Order fulfilled", build: (o: any) => `Order #${o.id} has been marked as fulfilled.` },
    { type: "promo", title: "Promo reminder", build: () => `Code FERREIRA10 is active. 3 redemptions today.` },
  ];
  for (let i = 0; i < 18; i++) {
    const tpl = templates[i % templates.length];
    const order = ORDERS[i % ORDERS.length];
    const convo = CONVERSATIONS[i % CONVERSATIONS.length];
    out.push({
      id: i + 1,
      type: tpl.type,
      title: tpl.title,
      message: tpl.type === "convo" ? (tpl.build as any)(convo) : tpl.type === "stock" || tpl.type === "promo" ? tpl.build() : (tpl.build as any)(order),
      read: i >= 5,
      relatedType: tpl.type === "order" || tpl.type === "fulfilment" ? "order" : tpl.type === "convo" ? "conversation" : null,
      relatedId: tpl.type === "order" || tpl.type === "fulfilment" ? order.id : tpl.type === "convo" ? convo.id : null,
      createdAt: new Date(now - i * randint(30, 240) * 60_000).toISOString(),
    });
  }
  return out;
}

const NOTIFICATIONS = makeNotifications();

export async function getNotifications(page = 1) {
  await delay();
  const perPage = 10;
  const start = (page - 1) * perPage;
  return {
    data: NOTIFICATIONS.slice(start, start + perPage),
    last_page: Math.max(1, Math.ceil(NOTIFICATIONS.length / perPage)),
    total: NOTIFICATIONS.length,
  };
}

export async function markNotificationRead(id: number) {
  await delay(120);
  const idx = NOTIFICATIONS.findIndex((n) => n.id === id);
  if (idx >= 0) NOTIFICATIONS[idx] = { ...NOTIFICATIONS[idx], read: true };
  return { ok: true };
}

// ── Audit ──────────────────────────────────────────────────────────────────
function makeAuditEvents(): AuditEvent[] {
  const actions: { action: string; detail: (arg?: any) => string }[] = [
    { action: "order_created", detail: (o: any) => `Created order #${o.id} for ${o.customerName ?? "Walk-in"}` },
    { action: "order_updated", detail: (o: any) => `Updated status of order #${o.id} to ${o.status}` },
    { action: "stock_adjusted", detail: () => `Adjusted stock for ${pick(PARTS)} at ${pick(BRANCHES)}` },
    { action: "convo_resolved", detail: (c: any) => `Resolved conversation with ${c.customerName}` },
    { action: "payment_received", detail: (o: any) => `Received ZAR ${o.total.toLocaleString("en", { minimumFractionDigits: 2 })} for order #${o.id}` },
    { action: "user_login", detail: () => `User logged in from ${pick(BRANCHES)} terminal` },
  ];
  const out: AuditEvent[] = [];
  const now = Date.now();
  for (let i = 0; i < 50; i++) {
    const act = actions[i % actions.length];
    const order = ORDERS[i % ORDERS.length];
    const convo = CONVERSATIONS[i % CONVERSATIONS.length];
    const actor = STAFF[i % STAFF.length];
    out.push({
      id: i + 1,
      action: act.action,
      actor,
      entity: act.action.includes("order") ? "Order" : act.action.includes("convo") ? "Conversation" : act.action.includes("stock") ? "Inventory" : "System",
      entityId: act.action.includes("order") ? order.id : act.action.includes("convo") ? convo.id : i + 100,
      details: act.action.includes("convo") ? act.detail(convo) : act.action.includes("order") || act.action.includes("payment") ? act.detail(order) : act.detail(),
      createdAt: new Date(now - i * randint(15, 120) * 60_000).toISOString(),
    });
  }
  return out;
}

const AUDIT_EVENTS = makeAuditEvents();

export async function getAuditLog(page = 1) {
  await delay();
  const perPage = 15;
  const start = (page - 1) * perPage;
  return {
    data: AUDIT_EVENTS.slice(start, start + perPage),
    last_page: Math.max(1, Math.ceil(AUDIT_EVENTS.length / perPage)),
    total: AUDIT_EVENTS.length,
  };
}

// ── Reports ──────────────────────────────────────────────────────────────────
function buildReports(): ReportsPayload {
  const byBranch = BRANCHES.map((b) => {
    const rows = ORDERS.filter((o) => o.branch === b);
    const revenue = rows.reduce((s, o) => s + o.total, 0);
    return { branch: b, revenue, orders: rows.length };
  });
  const bySource = SOURCES.map((s) => {
    const rows = ORDERS.filter((o) => o.source === s);
    const revenue = rows.reduce((sum, o) => sum + o.total, 0);
    return { source: s, count: rows.length, revenue };
  });
  const byStatus = STATUSES.map((s) => ({
    status: s,
    count: ORDERS.filter((o) => o.status === s).length,
  }));

  const months: { month: string; revenue: number; orders: number }[] = [];
  const now = new Date();
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const rows = ORDERS.filter((o) => {
      const dr = new Date(o.createdAt);
      return dr.getFullYear() === d.getFullYear() && dr.getMonth() === d.getMonth();
    });
    const revenue = rows.reduce((s, o) => s + o.total, 0);
    months.push({ month: key, revenue, orders: rows.length });
  }

  const totalRevenue = ORDERS.reduce((s, o) => s + o.total, 0);
  const totalOrders = ORDERS.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const fulfilled = ORDERS.filter((o) => o.status === "FULFILLED").length;
  const decided = ORDERS.filter((o) => o.status !== "PENDING").length;
  const fulfillmentRate = decided > 0 ? Math.round((fulfilled / decided) * 100) : 0;

  return {
    byBranch,
    bySource,
    byStatus,
    byMonth: months,
    totalRevenue,
    totalOrders,
    averageOrderValue,
    fulfillmentRate,
  };
}

const REPORTS = buildReports();

export async function getReports(): Promise<ReportsPayload> {
  await delay();
  return REPORTS;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
async function delay(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
