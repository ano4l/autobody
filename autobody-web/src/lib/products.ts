export type ProductCategory =
  | "Bumpers"
  | "Fenders"
  | "Headlights"
  | "Tail Lights"
  | "Bonnets"
  | "Mirrors"
  | "Grilles"
  | "Body Panels"
  | "Wheels"
  | "Brakes"
  | "Engine"
  | "Exhaust"
  | "Lighting";

export type ProductCondition = "New" | "Used" | "OEM" | "Aftermarket";

export type Product = {
  slug: string;
  name: string;
  brand: string;
  model: string;
  year?: string;
  category: ProductCategory;
  condition: ProductCondition;
  price: number;
  oldPrice?: number;
  discount?: string;
  rating: number;
  reviews: number;
  stock: number;
  availability: string;
  image: string;
  gallery?: string[];
  description: string;
  specs: { label: string; value: string }[];
  fitment?: string[];
  tags?: string[];
  featured?: boolean;
  trending?: boolean;
};

export const PRODUCTS: Product[] = [];

export const CATEGORIES: { name: ProductCategory; image: string }[] = [];

export const BRANDS: string[] = [];

export const CONDITIONS: ProductCondition[] = ["New", "Used", "OEM", "Aftermarket"];

export const FEATURE_TABS = [
  "Body Panels & Bumpers",
  "Lights & Mirrors",
  "Engine & Mechanical",
  "Trim & Accessories",
] as const;

export function getFeatured(): Product[] {
  return [];
}

export function getTrending(): Product[] {
  return [];
}

export function getByCategory(_category: ProductCategory): Product[] {
  return [];
}

export function findProduct(_slug: string): Product | undefined {
  return undefined;
}

export function relatedProducts(_slug: string, _limit = 4): Product[] {
  return [];
}
