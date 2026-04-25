"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, PackagePlus, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { inventoryItems, stockMovements, type InventoryItem } from "@/lib/autobody-ops-demo-data";

const categories = ["All", "Bumpers", "Headlights", "Fenders", "Tail Lights", "Grilles", "Mirrors"];
const brands = ["All", "Toyota", "Volkswagen", "BMW", "Ford", "Mercedes-Benz", "Hyundai"];

export function InventorySection() {
  const [items, setItems] = useState<InventoryItem[]>(inventoryItems);
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("All");
  const [category, setCategory] = useState("All");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState({
    sku: "",
    name: "",
    brand: "Toyota",
    model: "",
    category: "Bumpers",
    condition: "Aftermarket" as InventoryItem["condition"],
    price: 0,
    stock: 0,
  });

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return items.filter((item) => {
      const matchesQuery = [item.name, item.sku, item.model, item.compatibility].join(" ").toLowerCase().includes(needle);
      const matchesBrand = brand === "All" || item.brand === brand;
      const matchesCategory = category === "All" || item.category === category;
      return matchesQuery && matchesBrand && matchesCategory;
    });
  }, [brand, category, items, query]);

  const updateItem = (id: string, patch: Partial<InventoryItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const addItem = () => {
    if (!draft.name || !draft.sku) return;
    setItems((prev) => [
      {
        id: `inv-${Date.now()}`,
        cost: Math.round(draft.price * 0.62),
        reorderAt: 3,
        supplier: "Admin added",
        location: "Receiving",
        image: inventoryItems[0].image,
        compatibility: draft.model || "Fitment to confirm",
        monthlySales: 0,
        lastMovement: "Created by Admin, just now",
        ...draft,
      },
      ...prev,
    ]);
    setDraft({ sku: "", name: "", brand: "Toyota", model: "", category: "Bumpers", condition: "Aftermarket", price: 0, stock: 0 });
    setShowAdd(false);
  };

  const lowStock = items.filter((item) => item.stock <= item.reorderAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Live Inventory Management</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Search, filter, edit pricing, and restock demo catalogue items in real time.
          </p>
        </div>
        <Button className="rounded-lg" onClick={() => setShowAdd((value) => !value)}>
          <Plus className="h-4 w-4" />
          Add product
        </Button>
        <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-card p-2 text-center">
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
        </div>
      </div>

      {showAdd ? (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-semibold">Add New Product</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <input value={draft.sku} onChange={(event) => setDraft({ ...draft, sku: event.target.value })} placeholder="SKU" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
            <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Part name" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
            <select value={draft.brand} onChange={(event) => setDraft({ ...draft, brand: event.target.value })} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
              {brands.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}
            </select>
            <input value={draft.model} onChange={(event) => setDraft({ ...draft, model: event.target.value })} placeholder="Model / year" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
            <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
              {categories.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}
            </select>
            <select value={draft.condition} onChange={(event) => setDraft({ ...draft, condition: event.target.value as InventoryItem["condition"] })} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
              {["New", "Used", "OEM", "Aftermarket"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <input type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} placeholder="Price" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
            <input type="number" value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) })} placeholder="Stock" className="h-10 rounded-lg border border-border bg-background px-3 text-sm" />
          </div>
          <div className="mt-4 flex gap-2">
            <Button className="rounded-lg" onClick={addItem}>Save product</Button>
            <Button variant="secondary" className="rounded-lg" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      ) : null}

      <div className="sticky top-16 z-20 rounded-xl border border-border bg-card/95 p-3 shadow-sm backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by part name, SKU, model, or fitment"
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-accent"
            />
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
        <div className="grid gap-4">
          {filtered.map((item) => {
            const low = item.stock <= item.reorderAt;
            const editing = editingId === item.id;
            return (
              <article key={item.id} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="grid gap-4 p-4 md:grid-cols-[128px_1fr_auto]">
                  <img src={item.image} alt="" className="h-28 w-full rounded-lg object-cover md:w-32" />
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <Badge tone={low ? "rust" : "leaf"} dot>{low ? "Low stock" : "In stock"}</Badge>
                      <Badge tone="neutral">{item.condition}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.sku} · {item.model} · {item.compatibility}</p>
                    <div className="grid gap-2 text-sm sm:grid-cols-4">
                      <span><b>Stock:</b> {item.stock}</span>
                      <span><b>Reorder:</b> {item.reorderAt}</span>
                      <span><b>Supplier:</b> {item.supplier}</span>
                      <span><b>Bin:</b> {item.location}</span>
                    </div>
                    {editing ? (
                      <div className="grid gap-2 sm:grid-cols-3">
                        <input value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                        <input value={item.sku} onChange={(event) => updateItem(item.id, { sku: event.target.value })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                        <input value={item.model} onChange={(event) => updateItem(item.id, { model: event.target.value })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                        <input type="number" value={item.price} onChange={(event) => updateItem(item.id, { price: Number(event.target.value) })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                        <input type="number" value={item.stock} onChange={(event) => updateItem(item.id, { stock: Number(event.target.value) })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                        <Button variant="secondary" size="sm" onClick={() => setEditingId(null)}>Save changes</Button>
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-row gap-2 md:flex-col md:items-end">
                    <p className="text-lg font-semibold">R {item.price.toLocaleString("en-ZA")}</p>
                    <Button variant="outline" size="sm" onClick={() => setEditingId(editing ? null : item.id)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button size="sm" onClick={() => updateItem(item.id, { stock: item.stock + 5 })}>
                      <PackagePlus className="h-4 w-4" />
                      Restock +5
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => setItems((prev) => prev.filter((candidate) => candidate.id !== item.id))}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
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
                  <p className="text-xs text-muted-foreground">{item.stock} left · reorder from {item.supplier}</p>
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
                    <p className="text-xs text-muted-foreground">{event.staff} · {event.time}</p>
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
