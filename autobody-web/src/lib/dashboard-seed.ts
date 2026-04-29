// Empty local data source. Live environments should read from the backend.

export type RequisitionStatus = "pending" | "approved" | "denied" | "modification_requested" | "paid";

export interface Requisition {
  id: number;
  reference_no: string;
  requester: { id: number; name: string; email: string };
  department: string;
  supplier: string;
  description: string;
  currency: string;
  amount: string;
  status: RequisitionStatus;
  priority: "low" | "normal" | "high";
  required_by: string;
  current_stage: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardSummary {
  stats: {
    pending: number;
    approved: number;
    denied: number;
    paid: number;
    totalAmount: number;
    activeUsers: number;
  };
  recent: Requisition[];
}

export interface AuditEvent {
  id: number;
  action: string;
  actor: string;
  auditable_type: string;
  auditable_id: number;
  old_values: Record<string, unknown>;
  new_values: Record<string, unknown>;
  created_at: string;
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
  byDepartment: { department: string; amount: number; count: number }[];
  byStatus: { status: string; count: number }[];
  byMonth: { month: string; amount: number; count: number }[];
  totalAmount: number;
  totalCount: number;
  averageAmount: number;
}

const emptyPage = { data: [], last_page: 1, total: 0 };

export async function getDashboard(): Promise<DashboardSummary> {
  return {
    stats: { pending: 0, approved: 0, denied: 0, paid: 0, totalAmount: 0, activeUsers: 0 },
    recent: [],
  };
}

export async function getRequisitions(_status?: string, _page = 1) {
  return emptyPage as { data: Requisition[]; last_page: number; total: number };
}

export async function approveRequisition(_id: number, _comment?: string) {
  return { ok: true };
}

export async function denyRequisition(_id: number, _comment: string) {
  return { ok: true };
}

export async function requestModification(_id: number, _comment: string) {
  return { ok: true };
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
    byDepartment: [],
    byStatus: [],
    byMonth: [],
    totalAmount: 0,
    totalCount: 0,
    averageAmount: 0,
  };
}

export async function createDemoRequisition(_input: Record<string, unknown>) {
  return { ok: true };
}
