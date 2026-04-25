"use client";

import { Fragment, useMemo, useState } from "react";
import {
  AlertTriangle,
  ImagePlus,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { inventoryItems, stockMovements, type InventoryItem } from "@/lib/autobody-ops-demo-data";

const categories = ["All", "Bumpers", "Headlights", "Fenders", "Tail Lights", "Grilles", "Mirrors"];
const brands = ["All", "Toyota", "Volkswagen", "BMW", "Ford", "Mercedes-Benz", "Hyundai"];
const conditions: InventoryItem["condition"][] = ["New", "Used", "OEM", "Aftermarket"];

const blankDraft = {
  sku: "",
  name: "",
  brand: "Toyota",
  model: "",
  category: "Bumpers",
  condition: "Aftermarket" as InventoryItem["condition"],
  price: 0,
  cost: 0,
  stock: 0,
  reorderAt: 3,
  supplier: "",
  location: "",
  compatibility: "",
  image: inventoryItems[0].image,
};

export function InventorySection() {
  const [items, setItems] = useState<InventoryItem[]>(inventoryItems);
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("All");
  const [category, setCategory] = useState("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState(blankDraft);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return items.filter((item) => {
      const haystack = [item.name, item.sku, item.model, item.compatibility, item.supplier].join(" ").toLowerCase();
      return haystack.includes(needle) && (brand === "All" || item.brand === brand) && (category === "All" || item.category === category);
    });
  }, [brand, category, items, query]);

  const lowStock = items.filter((item) => item.stock <= item.reorderAt);
  const inventoryValue = items.reduce((sum, item) => sum + item.stock * item.cost, 0);

  const updateItem = (id: string, patch: Partial<InventoryItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const handleImageUpload = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setDraft((current) => ({ ...current, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const addItem = () => {
    if (!draft.name || !draft.sku) return;
    setItems((prev) => [
      {
        id: `inv-${Date.now()}`,
        ...draft,
        cost: draft.cost || Math.round(draft.price * 0.62),
        supplier: draft.supplier || "Admin added",
        location: draft.location || "Receiving",
        compatibility: draft.compatibility || draft.model || "Fitment to confirm",
        monthlySales: 0,
        lastMovement: "Created by Admin, just now",
      },
      ...prev,
    ]);
    setDraft(blankDraft);
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Live Inventory Management</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Corporate stock control with upload, fitment, margin, reorder, supplier, and movement data.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button className="h-10 rounded-lg px-4" onClick={() => setShowAdd((value) => !value)}>
            {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAdd ? "Close form" : "Add product"}
          </Button>
          <div className="grid grid-cols-4 gap-2 rounded-xl border border-border bg-card p-2 text-center">
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground">SKUs</p>
              <p className="text-lg font-semibold">{items.length}</p>
            </div>
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground">Units</p>
              <p className="text-lg font-semibold">{items.reduce((sum, item) => sum + item.stock, 0)}</p>
            </div>
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground">Low</p>
              <p className="text-lg font-semibold text-destructive">{lowStock.length}</p>
            </div>
            <div className="px-3 py-2">
              <p className="text-xs text-muted-foreground">Value</p>
              <p className="text-lg font-semibold">R{Math.round(inventoryValue / 1000)}k</p>
            </div>
          </div>
        </div>
      </div>

      {showAdd ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div>
              <h3 className="font-semibold">Add Inventory Product</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload a product image and capture the operational fields needed for POS, ecommerce, and reorder reports.
              </p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => setShowAdd(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-6 p-5 xl:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <section className="rounded-xl border border-border bg-background p-4">
                <h4 className="text-sm font-semibold">Product Identity</h4>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Part name</span>
                    <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Toyota Corolla Front Bumper" className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">SKU</span>
                    <input value={draft.sku} onChange={(event) => setDraft({ ...draft, sku: event.target.value })} placeholder="TY-COR-20-FB" className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Vehicle brand</span>
                    <select value={draft.brand} onChange={(event) => setDraft({ ...draft, brand: event.target.value })} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent">
                      {brands.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Model / year range</span>
                    <input value={draft.model} onChange={(event) => setDraft({ ...draft, model: event.target.value })} placeholder="Corolla 2020-2024" className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Category</span>
                    <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent">
                      {categories.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Condition</span>
                    <select value={draft.condition} onChange={(event) => setDraft({ ...draft, condition: event.target.value as InventoryItem["condition"] })} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent">
                      {conditions.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm md:col-span-2">
                    <span className="font-medium">Compatibility / fitment notes</span>
                    <input value={draft.compatibility} onChange={(event) => setDraft({ ...draft, compatibility: event.target.value })} placeholder="Corolla Quest, Corolla Sedan" className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-background p-4">
                <h4 className="text-sm font-semibold">Commercial Controls</h4>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Selling price</span>
                    <input type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Cost price</span>
                    <input type="number" value={draft.cost} onChange={(event) => setDraft({ ...draft, cost: Number(event.target.value) })} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Stock on hand</span>
                    <input type="number" value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) })} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Reorder at</span>
                    <input type="number" value={draft.reorderAt} onChange={(event) => setDraft({ ...draft, reorderAt: Number(event.target.value) })} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Supplier</span>
                    <input value={draft.supplier} onChange={(event) => setDraft({ ...draft, supplier: event.target.value })} placeholder="Prime Panels SA" className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Bin location</span>
                    <input value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} placeholder="Aisle A2" className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <section className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-2">
                  <ImagePlus className="h-4 w-4 text-accent" />
                  <h4 className="text-sm font-semibold">Product Image</h4>
                </div>
                <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card p-4 text-center transition hover:border-accent hover:bg-secondary/50">
                  <input type="file" accept="image/*" className="sr-only" onChange={(event) => handleImageUpload(event.target.files?.[0])} />
                  <img src={draft.image} alt="" className="h-48 w-full rounded-lg object-cover" />
                  <span className="mt-3 text-sm font-medium">Upload product photo</span>
                  <span className="mt-1 text-xs text-muted-foreground">Demo preview stores the uploaded image in browser state.</span>
                </label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {inventoryItems.slice(0, 6).map((item) => (
                    <button key={item.id} onClick={() => setDraft({ ...draft, image: item.image })} className="overflow-hidden rounded-lg border border-border transition hover:border-accent">
                      <img src={item.image} alt="" className="h-14 w-full object-cover" />
                    </button>
                  ))}
                </div>
              </section>

              <div className="rounded-xl border border-border bg-background p-4">
                <h4 className="text-sm font-semibold">Record Preview</h4>
                <p className="mt-2 text-sm font-medium">{draft.name || "Part name"}</p>
                <p className="mt-1 text-xs text-muted-foreground">{draft.sku || "SKU"} - {draft.model || "Model / year"}</p>
                <p className="mt-3 text-lg font-semibold">R {draft.price.toLocaleString("en-ZA")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{draft.stock} units - reorder at {draft.reorderAt}</p>
              </div>
            </aside>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border p-5">
            <Button variant="secondary" className="rounded-lg" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="rounded-lg" onClick={addItem} disabled={!draft.name || !draft.sku}>Save product</Button>
          </div>
        </div>
      ) : null}

      <div className="sticky top-16 z-20 rounded-xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by part name, SKU, model, supplier, or fitment" className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-accent" />
          </label>
          <select value={brand} onChange={(event) => setBrand(event.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            {brands.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <Button variant="outline" className="rounded-lg">
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold">Inventory Register</h3>
              <p className="text-xs text-muted-foreground">Inline stock, margin, supplier, and fitment controls</p>
            </div>
            <Badge tone="neutral">{filtered.length} shown</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-secondary/70 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Part</th>
                  <th className="px-4 py-3">Fitment</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Margin</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((item) => {
                  const low = item.stock <= item.reorderAt;
                  const editing = editingId === item.id;
                  const margin = item.price > 0 ? Math.round(((item.price - item.cost) / item.price) * 100) : 0;
                  return (
                    <Fragment key={item.id}>
                      <tr className="align-top transition hover:bg-secondary/35">
                        <td className="px-4 py-4">
                          <div className="flex gap-3">
                            <img src={item.image} alt="" className="h-16 w-20 rounded-lg object-cover" />
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-foreground">{item.name}</p>
                                <Badge tone={low ? "rust" : "leaf"} dot>{low ? "Low" : "In stock"}</Badge>
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground">{item.sku} - {item.category} - {item.condition}</p>
                              <p className="mt-2 font-semibold">R {item.price.toLocaleString("en-ZA")}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium">{item.brand} {item.model}</p>
                          <p className="mt-1 max-w-[260px] text-xs text-muted-foreground">{item.compatibility}</p>
                          <p className="mt-2 text-xs text-muted-foreground">Bin {item.location}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold">{item.stock} units</p>
                          <p className="text-xs text-muted-foreground">Reorder at {item.reorderAt}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className={cn("font-semibold", margin >= 35 ? "text-success" : "text-warning")}>{margin}%</p>
                          <p className="text-xs text-muted-foreground">Cost R {item.cost.toLocaleString("en-ZA")}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium">{item.supplier}</p>
                          <p className="max-w-[220px] text-xs text-muted-foreground">{item.lastMovement}</p>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setEditingId(editing ? null : item.id)}>
                              <Pencil className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button size="sm" onClick={() => updateItem(item.id, { stock: item.stock + 5 })}>
                              <PackagePlus className="h-4 w-4" />
                              +5
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => setItems((prev) => prev.filter((candidate) => candidate.id !== item.id))}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      {editing ? (
                        <tr key={`${item.id}-edit`} className="bg-secondary/30">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="grid gap-2 md:grid-cols-6">
                              <input value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                              <input value={item.sku} onChange={(event) => updateItem(item.id, { sku: event.target.value })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                              <input value={item.model} onChange={(event) => updateItem(item.id, { model: event.target.value })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                              <input type="number" value={item.price} onChange={(event) => updateItem(item.id, { price: Number(event.target.value) })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                              <input type="number" value={item.stock} onChange={(event) => updateItem(item.id, { stock: Number(event.target.value) })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                              <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>Save changes</Button>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              <h3 className="font-semibold">Low-Stock Alerts</h3>
            </div>
            <div className="mt-4 space-y-3">
              {lowStock.map((item) => (
                <div key={item.id} className="rounded-lg bg-secondary/60 p-3">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.stock} left - reorder from {item.supplier}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-semibold">Stock Movement Log</h3>
            <div className="mt-4 space-y-3">
              {stockMovements.map((event) => (
                <div key={`${event.item}-${event.time}`} className="flex items-start justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium">{event.item}</p>
                    <p className="text-xs text-muted-foreground">{event.staff} - {event.time}</p>
                  </div>
                  <span className={cn("font-semibold", event.qty > 0 ? "text-success" : "text-destructive")}>
                    {event.qty > 0 ? "+" : ""}{event.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
