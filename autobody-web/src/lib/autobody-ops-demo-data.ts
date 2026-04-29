export type InventoryCondition = "New" | "Used" | "OEM" | "Aftermarket";

export type InventoryItem = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  condition: InventoryCondition;
  price: number;
  cost: number;
  stock: number;
  reorderAt: number;
  supplier: string;
  location: string;
  image: string;
  compatibility: string;
  monthlySales: number;
  lastMovement: string;
};

export const PART_IMAGES = {
  placeholder:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='600' viewBox='0 0 900 600'%3E%3Crect width='900' height='600' fill='%23f4f5f9'/%3E%3Cpath d='M310 330h280M350 270h200M390 390h120' stroke='%239aa1ad' stroke-width='24' stroke-linecap='round'/%3E%3C/svg%3E",
};

export const inventoryItems: InventoryItem[] = [];

export const suppliers: {
  name: string;
  leadTime: string;
  openOrders: number;
  reliability: string;
  contact: string;
}[] = [];

export const stockMovements: {
  item: string;
  type: string;
  qty: number;
  staff: string;
  time: string;
}[] = [];
