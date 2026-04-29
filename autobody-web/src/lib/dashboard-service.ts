"use client";

// Dashboard data service.
//
// Demo mode (NEXT_PUBLIC_AUTH_MODE !== "real"): forwards every call to the
// deterministic mocks in `dashboard-autobody-seed.ts` so the dashboard works
// fully offline and the Playwright smoke suite stays green without a backend.
//
// Real mode (NEXT_PUBLIC_AUTH_MODE === "real"): hits the Spring backend at
// /api/dashboard, /api/orders, /api/conversations and maps the response DTOs
// into the shapes the section components already expect. Endpoints we don't
// have a backend for yet (notifications, audit, reports) stay on the mock
// implementation regardless of mode.
//
// This file is the only place section components import data from; that lets
// us swap data sources without touching every section.

import { api, ApiError } from "./api";
import { isDemoMode } from "./auth";
import * as demo from "./dashboard-autobody-seed";
import type {
  AuditEvent,
  Conversation,
  DashboardStats,
  DemoNotification,
  Order,
  ReportsPayload,
} from "./dashboard-autobody-seed";

export type {
  AuditEvent,
  Conversation,
  DashboardStats,
  DemoNotification,
  Order,
  ReportsPayload,
};

// ── Backend DTO shapes ───────────────────────────────────────────────────────
// Shadow types of the Spring records we consume; kept narrow on purpose.

interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

interface DashboardStatsDTO {
  todaySalesTotal: string | number;
  todayOrderCount: number;
  pendingOrderCount: number;
  openConversationCount: number;
  escalatedConversationCount: number;
  lowStockCount: number;
}

export type PosiboltSyncStatusValue = "NOT_CONFIGURED" | "IDLE" | "RUNNING" | "SUCCESS" | "FAILED";

export interface PosiboltSyncStatus {
  configured: boolean;
  enabled: boolean;
  status: PosiboltSyncStatusValue;
  lastStartedAt: string | null;
  lastFinishedAt: string | null;
  lastSuccessfulSyncAt: string | null;
  lastError: string | null;
  productsSynced: number;
  stockSynced: number;
  ordersSynced: number;
}

type OrderSourceBackend = "WALK_IN" | "SHOPIFY" | "WHATSAPP" | "WEB";
type OrderStatusBackend = "PENDING" | "CONFIRMED" | "FULFILLED" | "CANCELLED" | "REFUNDED";

interface OrderItemDTO {
  id: number | null;
  partId: number | null;
  partSku: string | null;
  partName: string | null;
  qty: number;
  unitPrice: string | number;
  lineTotal: string | number;
}

interface OrderDTO {
  id: number;
  customerId: number | null;
  customerName: string | null;
  source: OrderSourceBackend;
  status: OrderStatusBackend;
  subtotal: string | number;
  discount: string | number;
  total: string | number;
  shopifyOrderId: string | null;
  notes: string | null;
  handledById: number | null;
  handledByName: string | null;
  version: number | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItemDTO[];
}

type ConversationStatusBackend = "ACTIVE" | "ESCALATED" | "RESOLVED" | "TIMED_OUT";

interface ConversationDTO {
  id: number;
  customerId: number | null;
  customerName: string | null;
  customerPhone: string | null;
  waThreadId: string | null;
  status: ConversationStatusBackend;
  botStep: string | null;
  escalated: boolean;
  escalatedTo: number | null;
  partRequest: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Mappers ──────────────────────────────────────────────────────────────────

function toNumber(v: string | number | null | undefined, fallback = 0): number {
  if (v == null) return fallback;
  if (typeof v === "number") return v;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
}

function mapStats(dto: DashboardStatsDTO): DashboardStats {
  return {
    todaySalesTotal: toNumber(dto.todaySalesTotal),
    todayOrderCount: dto.todayOrderCount,
    pendingOrderCount: dto.pendingOrderCount,
    openConversationCount: dto.openConversationCount,
    escalatedConversationCount: dto.escalatedConversationCount,
    lowStockCount: dto.lowStockCount,
  };
}

function mapOrder(dto: OrderDTO): Order {
  return {
    id: dto.id,
    customerName: dto.customerName,
    source: dto.source,
    status: dto.status,
    total: toNumber(dto.total),
    items: (dto.items ?? []).map((it) => it.partName ?? it.partSku ?? `#${it.partId ?? "?"}`),
    // Backend has no branch concept yet; keep the existing default for parity.
    branch: "Pretoria",
    createdAt: dto.createdAt,
  };
}

const CONVERSATION_STATUS_MAP: Record<ConversationStatusBackend, Conversation["status"]> = {
  ACTIVE: "OPEN",
  ESCALATED: "ESCALATED",
  RESOLVED: "RESOLVED",
  TIMED_OUT: "WAITING",
};

function mapConversation(dto: ConversationDTO): Conversation {
  return {
    id: dto.id,
    customerName: dto.customerName ?? "Unknown Customer",
    channel: "WHATSAPP", // /api/conversations is the WhatsApp inbox today
    status: CONVERSATION_STATUS_MAP[dto.status] ?? "OPEN",
    message: dto.partRequest ?? "",
    vehicle: undefined,
    assignedTo: dto.escalatedTo != null ? `Agent #${dto.escalatedTo}` : "Bot",
    updatedAt: dto.updatedAt,
  };
}

// ── Pagination helpers ───────────────────────────────────────────────────────

function pageQuery(page: number, size: number, extra?: Record<string, string | undefined>) {
  // Backend uses 0-indexed Spring Pageable; section UIs are 1-indexed.
  const q: Record<string, string | number | undefined> = {
    page: Math.max(0, page - 1),
    size,
    ...extra,
  };
  return q;
}

interface PagedView<T> {
  data: T[];
  last_page: number;
  total: number;
}

function adaptPaged<TIn, TOut>(p: PagedResponse<TIn>, map: (x: TIn) => TOut): PagedView<TOut> {
  return {
    data: (p.items ?? []).map(map),
    last_page: Math.max(1, p.totalPages || 1),
    total: p.total ?? 0,
  };
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function getDashboardStats(): Promise<DashboardStats> {
  if (isDemoMode()) return demo.getDashboardStats();
  const dto = await api.get<DashboardStatsDTO>("/api/dashboard/stats");
  return mapStats(dto);
}

export async function getPosiboltSyncStatus(): Promise<PosiboltSyncStatus> {
  if (isDemoMode()) {
    return {
      configured: false,
      enabled: false,
      status: "NOT_CONFIGURED",
      lastStartedAt: null,
      lastFinishedAt: null,
      lastSuccessfulSyncAt: null,
      lastError: "Demo mode is using local seed data. Enable real auth mode and POSibolt env vars to connect.",
      productsSynced: 0,
      stockSynced: 0,
      ordersSynced: 0,
    };
  }
  return api.get<PosiboltSyncStatus>("/api/posibolt/status");
}

export async function triggerPosiboltSync(): Promise<PosiboltSyncStatus> {
  return api.post<PosiboltSyncStatus>("/api/posibolt/sync");
}

export async function getOrders(
  status?: string,
  page = 1,
): Promise<{ data: Order[]; last_page: number; total: number }> {
  if (isDemoMode()) return demo.getOrders(status, page);
  const query = pageQuery(page, 10, {
    status: status && status !== "all" ? status : undefined,
  });
  const dto = await api.get<PagedResponse<OrderDTO>>("/api/orders", { query });
  return adaptPaged(dto, mapOrder);
}

export async function getRecentOrders(limit = 6): Promise<Order[]> {
  if (isDemoMode()) return demo.getRecentOrders(limit);
  const dto = await api.get<PagedResponse<OrderDTO>>("/api/orders", {
    query: { page: 0, size: limit },
  });
  return (dto.items ?? []).map(mapOrder);
}

export async function getConversations(
  status?: string,
  page = 1,
): Promise<{ data: Conversation[]; last_page: number; total: number }> {
  if (isDemoMode()) return demo.getConversations(status, page);
  // Frontend status values map to backend differently — translate before sending.
  const reverseMap: Record<string, ConversationStatusBackend> = {
    OPEN: "ACTIVE",
    WAITING: "TIMED_OUT",
    ESCALATED: "ESCALATED",
    RESOLVED: "RESOLVED",
  };
  const backendStatus = status && status !== "all" ? reverseMap[status] : undefined;
  const query = pageQuery(page, 8, { status: backendStatus });
  const dto = await api.get<PagedResponse<ConversationDTO>>("/api/conversations", { query });
  return adaptPaged(dto, mapConversation);
}

// ── Demo-only pass-throughs (no backend endpoints yet) ───────────────────────
// These keep working in real mode too; they just return locally generated data.

export const getNotifications = demo.getNotifications;
export const markNotificationRead = demo.markNotificationRead;
export const getAuditLog = demo.getAuditLog;
export const getReports = demo.getReports;

// Re-export the ApiError so callers can branch on backend failures without
// importing from two places.
export { ApiError };
