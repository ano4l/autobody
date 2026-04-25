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
  bumper: "https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=900&q=82",
  headlight: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=900&q=80",
  fender: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=900&q=80",
  tailLight: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=900&q=80",
  grille: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=900&q=80",
  mirror: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=900&q=80",
};

export const inventoryItems: InventoryItem[] = [
  {
    id: "inv-001",
    sku: "TY-COR-20-FB",
    name: "Toyota Corolla Front Bumper",
    brand: "Toyota",
    model: "Corolla 2020-2024",
    category: "Bumpers",
    condition: "Aftermarket",
    price: 2450,
    cost: 1580,
    stock: 8,
    reorderAt: 4,
    supplier: "Prime Panels SA",
    location: "Aisle A2",
    image: PART_IMAGES.bumper,
    compatibility: "Corolla Quest, Corolla Sedan",
    monthlySales: 24,
    lastMovement: "Sale by Jan Ferreira, 24 Apr 2026 14:12",
  },
  {
    id: "inv-002",
    sku: "VW-POL-18-HL",
    name: "VW Polo Headlight",
    brand: "Volkswagen",
    model: "Polo 2018-2024",
    category: "Headlights",
    condition: "OEM",
    price: 1890,
    cost: 1210,
    stock: 3,
    reorderAt: 5,
    supplier: "Euro Auto Lighting",
    location: "Aisle B1",
    image: PART_IMAGES.headlight,
    compatibility: "Polo Vivo, Polo TSI",
    monthlySales: 31,
    lastMovement: "Restock by Nadia Smith, 24 Apr 2026 09:40",
  },
  {
    id: "inv-003",
    sku: "BMW-F30-RF",
    name: "BMW 3 Series Fender",
    brand: "BMW",
    model: "3 Series F30",
    category: "Fenders",
    condition: "Used",
    price: 3200,
    cost: 2100,
    stock: 2,
    reorderAt: 3,
    supplier: "Cape Prestige Spares",
    location: "Aisle C4",
    image: PART_IMAGES.fender,
    compatibility: "F30 Sedan, F31 Touring",
    monthlySales: 9,
    lastMovement: "Adjustment by Jan Ferreira, 23 Apr 2026 16:18",
  },
  {
    id: "inv-004",
    sku: "FR-RAN-16-TL",
    name: "Ford Ranger Tail Light",
    brand: "Ford",
    model: "Ranger 2016-2022",
    category: "Tail Lights",
    condition: "New",
    price: 1320,
    cost: 760,
    stock: 12,
    reorderAt: 6,
    supplier: "Northern Commercial Parts",
    location: "Aisle B3",
    image: PART_IMAGES.tailLight,
    compatibility: "Ranger Double Cab, SuperCab",
    monthlySales: 18,
    lastMovement: "Sale by Thabo Mokoena, 24 Apr 2026 11:02",
  },
  {
    id: "inv-005",
    sku: "MB-W205-GR",
    name: "Mercedes C-Class Grille",
    brand: "Mercedes-Benz",
    model: "C-Class W205",
    category: "Grilles",
    condition: "OEM",
    price: 4100,
    cost: 2880,
    stock: 1,
    reorderAt: 2,
    supplier: "Prestige German Parts",
    location: "Aisle D1",
    image: PART_IMAGES.grille,
    compatibility: "C180, C200, C220d",
    monthlySales: 6,
    lastMovement: "Sale by Nadia Smith, 22 Apr 2026 15:31",
  },
  {
    id: "inv-006",
    sku: "HY-I20-15-SM",
    name: "Hyundai i20 Side Mirror",
    brand: "Hyundai",
    model: "i20 2015-2020",
    category: "Mirrors",
    condition: "Aftermarket",
    price: 980,
    cost: 540,
    stock: 15,
    reorderAt: 5,
    supplier: "KoreaLine Auto",
    location: "Aisle A5",
    image: PART_IMAGES.mirror,
    compatibility: "i20 Motion, i20 Fluid",
    monthlySales: 22,
    lastMovement: "Receipt by Jan Ferreira, 24 Apr 2026 08:10",
  },
];

export const suppliers = [
  { name: "Prime Panels SA", leadTime: "2 days", openOrders: 3, reliability: "98%", contact: "orders@primepanels.co.za" },
  { name: "Euro Auto Lighting", leadTime: "4 days", openOrders: 2, reliability: "94%", contact: "sales@euroautolighting.co.za" },
  { name: "Prestige German Parts", leadTime: "5 days", openOrders: 1, reliability: "96%", contact: "parts@prestigegerman.co.za" },
];

export const stockMovements = [
  { item: "Toyota Corolla Front Bumper", type: "Sale", qty: -1, staff: "Jan Ferreira", time: "24 Apr 2026 14:12" },
  { item: "VW Polo Headlight", type: "Receipt", qty: 6, staff: "Nadia Smith", time: "24 Apr 2026 09:40" },
  { item: "BMW 3 Series Fender", type: "Adjustment", qty: -1, staff: "Jan Ferreira", time: "23 Apr 2026 16:18" },
  { item: "Hyundai i20 Side Mirror", type: "Receipt", qty: 10, staff: "Jan Ferreira", time: "24 Apr 2026 08:10" },
];
