"use client";

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

const emptyPage = { data: [], last_page: 1, total: 0 };

export async function getDashboardStats(): Promise<DashboardStats> {
  return {
    todaySalesTotal: 0,
    todayOrderCount: 0,
    pendingOrderCount: 0,
    openConversationCount: 0,
    escalatedConversationCount: 0,
    lowStockCount: 0,
  };
}

export async function getOrders(_status?: string, _page = 1) {
  return emptyPage as { data: Order[]; last_page: number; total: number };
}

export async function getRecentOrders(_limit = 6): Promise<Order[]> {
  return [];
}

export async function getConversations(_status?: string, _page = 1) {
  return emptyPage as { data: Conversation[]; last_page: number; total: number };
}

export async function getNotifications(_page = 1) {
  return emptyPage as { data: DemoNotification[]; last_page: number; total: number };
}

export async function markNotificationRead(_id: number) {
  return { ok: true };
}

export async function getAuditLog(_page = 1) {
  return emptyPage as { data: AuditEvent[]; last_page: number; total: number };
}

export async function getReports(): Promise<ReportsPayload> {
  return {
    byBranch: [],
    bySource: [],
    byStatus: [],
    byMonth: [],
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    fulfillmentRate: 0,
  };
}
