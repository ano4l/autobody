// Deterministic seeded demo data for the dashboard. No backend, no randomness across reloads.

export type ReqStatus =
  | "draft"
  | "submitted"
  | "stage1_approved"
  | "modification_requested"
  | "approved"
  | "processing"
  | "paid"
  | "outstanding"
  | "fulfilled"
  | "closed"
  | "denied";

export interface Requisition {
  id: number;
  reference_no: string;
  project_name: string;
  category: string;
  branch: string;
  amount: string;
  currency: string;
  status: ReqStatus;
  purpose: string;
  cost_center: string;
  budget_code: string;
  needed_by: string;
  created_at: string;
  requester: { name: string; email: string };
}

export interface DashboardSummary {
  total_requisitions: number;
  pending_approvals: number;
  avg_turnaround_hours: number | null;
  unread_notifications: number;
}

export interface AuditEvent {
  id: number;
  auditable_type: string;
  auditable_id: number;
  action: string;
  actor_id: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor: { name: string };
}

export interface DemoNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  related_type: string | null;
  related_id: number | null;
  created_at: string;
}

export interface ReportsPayload {
  by_category: { category: string; count: number; total: string }[];
  by_branch: { branch: string; count: number; total: string }[];
  by_status: { status: string; count: number }[];
  by_month: { month: string; count: number; total: string }[];
  total_spend: string;
  approval_rate: number;
  total_requisitions: number;
}

// ── Deterministic PRNG (mulberry32) ──────────────────────────────────────────
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

const rand = mulberry32(20260425);
const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rand() * arr.length)];
const randint = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;

// ── Domain dictionaries ──────────────────────────────────────────────────────
const BRANCHES = ["pretoria", "johannesburg", "cape_town", "durban"] as const;
const CATEGORIES = [
  "collision_panels",
  "lighting",
  "brakes_suspension",
  "wheels_tyres",
  "engine_mechanical",
  "body_trim",
  "consumables",
] as const;

const VEHICLES = [
  "Toyota Hilux 2.4 GD-6",
  "VW Polo Vivo 1.4",
  "BMW 320i F30",
  "Mercedes C200 W205",
  "Ford Ranger XLT",
  "Hyundai i20",
  "Nissan NP200",
  "Kia Sportage",
  "Mazda CX-5",
  "Isuzu D-Max",
  "Toyota Corolla Quest",
  "VW Golf 7 GTI",
  "Audi A4 B9",
  "Suzuki Swift",
  "Renault Kwid",
];

const REPAIR_TYPES = [
  "Front bumper replacement",
  "Headlight assembly install",
  "Suspension overhaul",
  "Brake pad + rotor refresh",
  "Side mirror swap",
  "Bonnet panel beat",
  "Rear taillight set",
  "Alloy wheel set fitment",
  "Tyre fitment and balancing",
  "Engine mount kit",
  "Radiator and cooling fan",
  "Door skin and trim",
  "Grille and badge restore",
  "Quarter panel weld + paint",
  "Windscreen and rubbers",
];

const REQUESTERS = [
  { name: "Jan Ferreira", email: "jan@ferreiras.local" },
  { name: "Sipho Khumalo", email: "sipho@ferreiras.local" },
  { name: "Lerato Mokoena", email: "lerato@ferreiras.local" },
  { name: "Pieter van Zyl", email: "pieter@ferreiras.local" },
  { name: "Nadia Patel", email: "nadia@ferreiras.local" },
  { name: "Thabo Dube", email: "thabo@ferreiras.local" },
  { name: "Anika du Plessis", email: "anika@ferreiras.local" },
  { name: "Kabelo Sithole", email: "kabelo@ferreiras.local" },
];

const COST_CENTERS = ["CC-PARTS-01", "CC-WORK-02", "CC-PAINT-03", "CC-FLEET-04", "CC-OPS-05"];
const BUDGET_CODES = ["BUD-2026-A", "BUD-2026-B", "BUD-2026-C", "BUD-2026-D"];

const STATUS_DISTRIBUTION: ReqStatus[] = [
  "submitted", "submitted", "submitted",
  "stage1_approved", "stage1_approved",
  "approved", "approved",
  "processing", "processing",
  "paid",
  "fulfilled", "fulfilled",
  "closed",
  "modification_requested",
  "denied",
  "draft",
  "outstanding",
];

// ── Generators ───────────────────────────────────────────────────────────────
function makeRequisitions(count: number): Requisition[] {
  const out: Requisition[] = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const id = i + 1;
    const refNo = `FER-2026-${String(2000 + id).padStart(4, "0")}`;
    const status = STATUS_DISTRIBUTION[i % STATUS_DISTRIBUTION.length];
    const requester = REQUESTERS[i % REQUESTERS.length];
    const branch = BRANCHES[i % BRANCHES.length];
    const category = CATEGORIES[i % CATEGORIES.length];
    const vehicle = VEHICLES[i % VEHICLES.length];
    const repair = REPAIR_TYPES[i % REPAIR_TYPES.length];
    const amount = (randint(450, 24500) + randint(0, 99) / 100).toFixed(2);
    const daysAgo = randint(0, 60);
    const createdAt = new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    const neededBy = new Date(now + randint(2, 21) * 24 * 60 * 60 * 1000).toISOString();
    out.push({
      id,
      reference_no: refNo,
      project_name: `${vehicle} – ${repair}`,
      category,
      branch,
      amount,
      currency: "ZAR",
      status,
      purpose: `${repair} for client ${requester.name.split(" ")[0]}'s ${vehicle}. Customer signed off on quote and parts list. Source confirmed via dealer network.`,
      cost_center: COST_CENTERS[i % COST_CENTERS.length],
      budget_code: BUDGET_CODES[i % BUDGET_CODES.length],
      needed_by: neededBy,
      created_at: createdAt,
      requester,
    });
  }
  // newest first
  out.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  return out;
}

const REQUISITIONS = makeRequisitions(72);

function makeAuditEvents(): AuditEvent[] {
  const actions = [
    "created", "submitted", "stage1_approved", "approved", "denied",
    "modification_requested", "processing", "paid", "fulfilled", "closed",
    "attachment_uploaded", "comment_added",
  ];
  const events: AuditEvent[] = [];
  let eid = 1;
  for (let i = 0; i < 60; i++) {
    const req = REQUISITIONS[i % REQUISITIONS.length];
    const action = actions[i % actions.length];
    const actor = REQUESTERS[(i + 2) % REQUESTERS.length];
    const ts = new Date(+new Date(req.created_at) + randint(0, 72) * 60 * 60 * 1000).toISOString();
    events.push({
      id: eid++,
      auditable_type: "App\\Models\\Requisition",
      auditable_id: req.id,
      action,
      actor_id: (i % REQUESTERS.length) + 1,
      metadata: null,
      created_at: ts,
      actor: { name: actor.name },
    });
  }
  events.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  return events;
}

const AUDIT_EVENTS = makeAuditEvents();

function makeNotifications(): DemoNotification[] {
  const templates = [
    { type: "submission", title: "New requisition submitted", build: (r: Requisition) => `${r.requester.name} submitted ${r.reference_no} for ${r.currency} ${Number(r.amount).toLocaleString("en", { minimumFractionDigits: 2 })}.` },
    { type: "approval", title: "Requisition approved", build: (r: Requisition) => `${r.reference_no} cleared Stage 1 approval and is awaiting final sign-off.` },
    { type: "denial", title: "Requisition denied", build: (r: Requisition) => `${r.reference_no} was denied. See comments for the reason.` },
    { type: "modify", title: "Modification requested", build: (r: Requisition) => `Approver requested changes on ${r.reference_no} before sign-off.` },
    { type: "paid", title: "Payment processed", build: (r: Requisition) => `${r.reference_no} payment of ${r.currency} ${Number(r.amount).toLocaleString("en", { minimumFractionDigits: 2 })} cleared.` },
    { type: "attachment", title: "Attachment uploaded", build: (r: Requisition) => `New supporting document on ${r.reference_no}.` },
  ];
  const out: DemoNotification[] = [];
  for (let i = 0; i < 22; i++) {
    const tpl = templates[i % templates.length];
    const req = REQUISITIONS[i % REQUISITIONS.length];
    const created = new Date(Date.now() - i * 3.5 * 60 * 60 * 1000).toISOString();
    out.push({
      id: i + 1,
      type: tpl.type,
      title: tpl.title,
      message: tpl.build(req),
      read: i >= 6,
      related_type: "App\\Models\\Requisition",
      related_id: req.id,
      created_at: created,
    });
  }
  return out;
}

const NOTIFICATIONS = makeNotifications();

function buildReports(): ReportsPayload {
  const by_category = CATEGORIES.map((c) => {
    const rows = REQUISITIONS.filter((r) => r.category === c);
    const total = rows.reduce((s, r) => s + Number(r.amount), 0);
    return { category: c, count: rows.length, total: total.toFixed(2) };
  });
  const by_branch = BRANCHES.map((b) => {
    const rows = REQUISITIONS.filter((r) => r.branch === b);
    const total = rows.reduce((s, r) => s + Number(r.amount), 0);
    return { branch: b, count: rows.length, total: total.toFixed(2) };
  });
  const statuses = Array.from(new Set(REQUISITIONS.map((r) => r.status)));
  const by_status = statuses.map((s) => ({
    status: s,
    count: REQUISITIONS.filter((r) => r.status === s).length,
  }));

  // Group by YYYY-MM, last 6 months
  const months: { month: string; count: number; total: string }[] = [];
  const now = new Date();
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const rows = REQUISITIONS.filter((r) => {
      const dr = new Date(r.created_at);
      return dr.getFullYear() === d.getFullYear() && dr.getMonth() === d.getMonth();
    });
    const total = rows.reduce((s, r) => s + Number(r.amount), 0);
    months.push({ month: key, count: rows.length, total: total.toFixed(2) });
  }

  const total_spend = REQUISITIONS.reduce((s, r) => s + Number(r.amount), 0).toFixed(2);
  const settled = REQUISITIONS.filter((r) =>
    ["approved", "processing", "paid", "fulfilled", "closed"].includes(r.status),
  ).length;
  const decided = REQUISITIONS.filter((r) => r.status !== "draft" && r.status !== "submitted").length;
  const approval_rate = decided > 0 ? Math.round((settled / decided) * 100) : 0;

  return {
    by_category,
    by_branch,
    by_status,
    by_month: months,
    total_spend,
    approval_rate,
    total_requisitions: REQUISITIONS.length,
  };
}

const REPORTS = buildReports();

// ── Public API (mimics the lib/api shape used in e-requisition-ui) ────────────
async function delay(ms = 220) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getDashboard(): Promise<DashboardSummary> {
  await delay();
  return {
    total_requisitions: REQUISITIONS.length,
    pending_approvals: REQUISITIONS.filter(
      (r) => r.status === "submitted" || r.status === "stage1_approved",
    ).length,
    avg_turnaround_hours: 18,
    unread_notifications: NOTIFICATIONS.filter((n) => !n.read).length,
  };
}

export async function getRequisitions(status?: string, page = 1) {
  await delay();
  const all = !status || status === "all"
    ? REQUISITIONS
    : REQUISITIONS.filter((r) => r.status === status);
  const perPage = 10;
  const start = (page - 1) * perPage;
  return {
    data: all.slice(start, start + perPage),
    last_page: Math.max(1, Math.ceil(all.length / perPage)),
    total: all.length,
  };
}

export async function approveRequisition(id: number, _comment?: string) {
  await delay(250);
  const idx = REQUISITIONS.findIndex((r) => r.id === id);
  if (idx >= 0) {
    const r = REQUISITIONS[idx];
    REQUISITIONS[idx] = { ...r, status: r.status === "submitted" ? "stage1_approved" : "approved" };
  }
  return { ok: true };
}

export async function denyRequisition(id: number, _comment: string) {
  await delay(250);
  const idx = REQUISITIONS.findIndex((r) => r.id === id);
  if (idx >= 0) REQUISITIONS[idx] = { ...REQUISITIONS[idx], status: "denied" };
  return { ok: true };
}

export async function requestModification(id: number, _comment: string) {
  await delay(250);
  const idx = REQUISITIONS.findIndex((r) => r.id === id);
  if (idx >= 0) REQUISITIONS[idx] = { ...REQUISITIONS[idx], status: "modification_requested" };
  return { ok: true };
}

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

export async function getReports(): Promise<ReportsPayload> {
  await delay();
  return REPORTS;
}

export async function createDemoRequisition(input: {
  project_name: string;
  category: string;
  branch: string;
  amount: number;
  purpose: string;
  cost_center?: string;
  budget_code?: string;
  needed_by?: string;
}) {
  await delay(380);
  const nextId = REQUISITIONS.length + 1;
  const refNo = `FER-2026-${String(2000 + nextId).padStart(4, "0")}`;
  const now = new Date().toISOString();
  const requester = REQUESTERS[0];
  const newReq: Requisition = {
    id: nextId,
    reference_no: refNo,
    project_name: input.project_name,
    category: input.category,
    branch: input.branch,
    amount: input.amount.toFixed(2),
    currency: "ZAR",
    status: "submitted",
    purpose: input.purpose,
    cost_center: input.cost_center ?? COST_CENTERS[0],
    budget_code: input.budget_code ?? BUDGET_CODES[0],
    needed_by: input.needed_by ?? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: now,
    requester,
  };
  REQUISITIONS.unshift(newReq);
  NOTIFICATIONS.unshift({
    id: NOTIFICATIONS.length + 1,
    type: "submission",
    title: "New requisition submitted",
    message: `${requester.name} submitted ${refNo} for ZAR ${input.amount.toLocaleString("en", { minimumFractionDigits: 2 })}.`,
    read: false,
    related_type: "App\\Models\\Requisition",
    related_id: nextId,
    created_at: now,
  });
  return newReq;
}
