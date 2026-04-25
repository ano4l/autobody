export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface PagedResponse<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export type Role = "ADMIN" | "SALESPERSON" | "WAREHOUSE" | "VIEW_ONLY";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: Role;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresInMs: number;
  user: AuthUser;
}

export interface DashboardStats {
  todaySalesTotal: number;
  todayOrderCount: number;
  pendingOrderCount: number;
  openConversationCount: number;
  escalatedConversationCount: number;
  lowStockCount: number;
}

export interface Supplier {
  id: number;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  leadTimeDays?: number | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Part {
  id: number;
  sku: string;
  name: string;
  category?: string | null;
  make?: string | null;
  model?: string | null;
  yearRangeStart?: number | null;
  yearRangeEnd?: number | null;
  qtyOnHand: number;
  lowStockThreshold?: number | null;
  costPrice?: number | null;
  sellPrice: number;
  location?: string | null;
  supplierId?: number | null;
  supplierName?: string | null;
  active: boolean;
  lowStock?: boolean;
}

export type OrderStatus = "PENDING" | "CONFIRMED" | "FULFILLED" | "CANCELLED" | "REFUNDED";
export type OrderSource = "WALK_IN" | "WHATSAPP" | "SHOPIFY" | "WEB";

export interface OrderItem {
  id: number;
  partId: number;
  partSku: string;
  partName: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  customerId?: number | null;
  customerName?: string | null;
  source: OrderSource;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  total: number;
  shopifyOrderId?: string | null;
  notes?: string | null;
  handledById?: number | null;
  items?: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export type ConversationStatus = "ACTIVE" | "ESCALATED" | "RESOLVED" | "TIMED_OUT";

export interface Conversation {
  id: number;
  customerId?: number | null;
  customerName?: string | null;
  customerPhone?: string | null;
  waThreadId?: string | null;
  status: ConversationStatus;
  botStep?: string | null;
  escalated: boolean;
  escalatedTo?: number | null;
  partRequest?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PosSession {
  id: number;
  cashierId: number;
  cashierName?: string | null;
  openedAt: string;
  closedAt?: string | null;
  openingFloat: number;
  closingFloat?: number | null;
  notes?: string | null;
}

export interface SalesPoint {
  bucket: string;
  revenue: number;
  orderCount: number;
}

export interface TopPart {
  partId: number;
  sku: string;
  name: string;
  qtySold: number;
  revenue: number;
}

export interface DeadStockRow {
  partId: number;
  sku: string;
  name: string;
  qtyOnHand: number;
  costPrice?: number | null;
  sellPrice: number;
  lastSaleAt?: string | null;
  daysSinceLastSale?: number | null;
}

export interface MarginRow {
  partId: number;
  sku: string;
  name: string;
  qtySold: number;
  revenue: number;
  margin: number;
}
