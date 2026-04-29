"use client";

import { Fragment, useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  ClipboardList,
  Download,
  ImagePlus,
  PackageCheck,
  PackagePlus,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
  Warehouse,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PART_IMAGES, inventoryItems, stockMovements, suppliers, type InventoryItem } from "@/lib/autobody-ops-demo-data";
import { toast } from "@/lib/toast";

const categories = ["All"];
const brands = ["All"];
const conditions: Array<"All" | InventoryItem["condition"]> = ["All", "New", "Used", "OEM", "Aftermarket"];
const views = ["All stock", "Low stock", "Fast movers", "High value", "Dead stock"];

const blankDraft = {
  sku: "",
  name: "",
  brand: "",
  model: "",
  category: "",
  condition: "Aftermarket" as InventoryItem["condition"],
  price: 0,
  cost: 0,
  stock: 0,
  reorderAt: 3,
  supplier: "",
  location: "",
  compatibility: "",
  image: PART_IMAGES.placeholder,
};

function formatCurrency(value: number) {
  return `R ${value.toLocaleString("en-ZA", { maximumFractionDigits: 0 })}`;
}

function stockHealth(item: InventoryItem) {
  if (item.stock <= item.reorderAt) return { label: "Reorder", tone: "rust" as const };
  if (item.stock <= item.reorderAt * 2) return { label: "Watch", tone: "amber" as const };
  return { label: "Healthy", tone: "leaf" as const };
}

export function InventorySection() {
  const [items, setItems] = useState<InventoryItem[]>(inventoryItems);
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("All");
  const [category, setCategory] = useState("All");
  const [condition, setCondition] = useState<(typeof conditions)[number]>("All");
  const [view, setView] = useState("All stock");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [draft, setDraft] = useState(blankDraft);

  const enrichedItems = useMemo(() => {
    return items.map((item) => {
      const reserved = Math.max(0, Math.min(item.stock, Math.ceil(item.monthlySales / 7)));
      const available = Math.max(0, item.stock - reserved);
      const onOrder = item.stock <= item.reorderAt ? item.reorderAt * 3 : Math.max(0, item.reorderAt - reserved);
      const value = item.stock * item.cost;
      const margin = item.price > 0 ? Math.round(((item.price - item.cost) / item.price) * 100) : 0;
      const daysCover = item.monthlySales > 0 ? Math.round((available / item.monthlySales) * 30) : 999;
      const velocity = item.monthlySales >= 24 ? "A" : item.monthlySales >= 12 ? "B" : "C";
      return { ...item, reserved, available, onOrder, value, margin, daysCover, velocity };
    });
  }, [items]);

  const filtered = useMemo(() => {
    const needle = query.toLowerCase();
    return enrichedItems.filter((item) => {
      const haystack = [item.name, item.sku, item.model, item.compatibility, item.supplier, item.location].join(" ").toLowerCase();
      const matchesView =
        view === "All stock" ||
        (view === "Low stock" && item.stock <= item.reorderAt) ||
        (view === "Fast movers" && item.velocity === "A") ||
        (view === "High value" && item.value >= 10000) ||
        (view === "Dead stock" && item.monthlySales <= 6);

      return (
        haystack.includes(needle) &&
        (brand === "All" || item.brand === brand) &&
        (category === "All" || item.category === category) &&
        (condition === "All" || item.condition === condition) &&
        matchesView
      );
    });
  }, [brand, category, condition, enrichedItems, query, view]);

  const lowStock = enrichedItems.filter((item) => item.stock <= item.reorderAt);
  const inventoryValue = enrichedItems.reduce((sum, item) => sum + item.value, 0);
  const grossMargin = enrichedItems.reduce((sum, item) => sum + (item.price - item.cost) * item.stock, 0);
  const totalUnits = enrichedItems.reduce((sum, item) => sum + item.stock, 0);
  const selectedCount = selectedIds.length;

  const updateItem = (id: string, patch: Partial<InventoryItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const receiveStock = (item: InventoryItem) => {
    updateItem(item.id, { stock: item.stock + 5, lastMovement: "Receipt added just now" });
    toast.success("Stock received", `Added 5 units of ${item.name} (now ${item.stock + 5} on hand).`);
  };

  const deleteItem = (item: InventoryItem) => {
    setItems((prev) => prev.filter((candidate) => candidate.id !== item.id));
    setSelectedIds((prev) => prev.filter((id) => id !== item.id));
    toast.warning("Item removed", `${item.name} (${item.sku}) deleted from the catalogue.`);
  };

  const saveInline = () => {
    setEditingId(null);
    toast.success("Changes saved", "Inventory record updated locally.");
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((selected) => selected !== id) : [...prev, id]));
  };

  const toggleAllFiltered = () => {
    setSelectedIds((prev) => (prev.length === filtered.length ? [] : filtered.map((item) => item.id)));
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
    if (!draft.name || !draft.sku) {
      toast.error("Missing details", "Part name and SKU are required before saving.");
      return;
    }
    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      ...draft,
      cost: draft.cost || Math.round(draft.price * 0.62),
      supplier: draft.supplier || "Admin added",
      location: draft.location || "Receiving",
      compatibility: draft.compatibility || draft.model || "Fitment to confirm",
      monthlySales: 0,
      lastMovement: "Created by Admin, just now",
    };
    setItems((prev) => [newItem, ...prev]);
    setDraft(blankDraft);
    setShowAdd(false);
    toast.success("Item created", `${newItem.name} (${newItem.sku}) added to inventory.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Warehouse className="h-4 w-4" />
            Ferreira&apos;s ERP Inventory
          </div>
          <h2 className="mt-1 text-xl font-semibold text-foreground">Inventory Control Centre</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Item master, stock availability, reorder controls, supplier visibility, and full movement traceability.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            className="rounded-lg"
            onClick={() =>
              toast.info("CSV import", "Drop a CSV onto the dashboard once the supplier price file lands.")
            }
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Button>
          <Button
            variant="outline"
            className="rounded-lg"
            onClick={() =>
              toast.success("Inventory exported", `${enrichedItems.length} rows downloaded as inventory.csv (demo).`)
            }
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button className="rounded-lg" onClick={() => setShowAdd((value) => !value)}>
            {showAdd ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAdd ? "Close form" : "New inventory item"}
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Inventory value", value: formatCurrency(inventoryValue), icon: Boxes, caption: `${totalUnits} units on hand` },
          { label: "Gross margin held", value: formatCurrency(grossMargin), icon: BarChart3, caption: "Projected across stock" },
          { label: "Reorder alerts", value: lowStock.length.toString(), icon: AlertTriangle, caption: "Below minimum level" },
          { label: "Suppliers", value: suppliers.length.toString(), icon: PackageCheck, caption: "Active preferred vendors" },
          { label: "Audit coverage", value: "100%", icon: ShieldCheck, caption: "Every movement logged" },
        ].map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <Icon className="h-4 w-4 text-accent" />
              </div>
              <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.caption}</p>
            </div>
          );
        })}
      </div>

      {showAdd ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div>
              <h3 className="font-semibold">Create Item Master Record</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Upload the part photo, set fitment, pricing, reorder rules, supplier, and warehouse bin before it appears in POS and ecommerce.
              </p>
            </div>
            <Button variant="ghost" size="icon" className="rounded-lg" onClick={() => setShowAdd(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid gap-6 p-5 xl:grid-cols-[1fr_380px]">
            <div className="space-y-4">
              <section className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-accent" />
                  <h4 className="text-sm font-semibold">Item Master</h4>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Part name</span>
                    <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Part name" className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">SKU / barcode</span>
                    <input value={draft.sku} onChange={(event) => setDraft({ ...draft, sku: event.target.value })} placeholder="SKU / barcode" className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Vehicle brand</span>
                    <select value={draft.brand} onChange={(event) => setDraft({ ...draft, brand: event.target.value })} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent">
                      <option value="">Select brand</option>
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Model / year range</span>
                    <input value={draft.model} onChange={(event) => setDraft({ ...draft, model: event.target.value })} placeholder="Model / year range" className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Category</span>
                    <select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent">
                      <option value="">Select category</option>
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Condition</span>
                    <select value={draft.condition} onChange={(event) => setDraft({ ...draft, condition: event.target.value as InventoryItem["condition"] })} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent">
                      {conditions.filter((item) => item !== "All").map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="space-y-1.5 text-sm md:col-span-2">
                    <span className="font-medium">Compatibility / fitment notes</span>
                    <input value={draft.compatibility} onChange={(event) => setDraft({ ...draft, compatibility: event.target.value })} placeholder="Compatibility / fitment notes" className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                </div>
              </section>

              <section className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-center gap-2">
                  <PackageCheck className="h-4 w-4 text-accent" />
                  <h4 className="text-sm font-semibold">Commercial and Warehouse Controls</h4>
                </div>
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
                    <span className="font-medium">Reorder point</span>
                    <input type="number" value={draft.reorderAt} onChange={(event) => setDraft({ ...draft, reorderAt: Number(event.target.value) })} className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Supplier</span>
                    <input value={draft.supplier} onChange={(event) => setDraft({ ...draft, supplier: event.target.value })} placeholder="Supplier name" className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  </label>
                  <label className="space-y-1.5 text-sm">
                    <span className="font-medium">Warehouse bin</span>
                    <input value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} placeholder="Warehouse bin" className="h-10 w-full rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
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
                  <span className="mt-3 text-sm font-medium">Upload part photo</span>
                  <span className="mt-1 text-xs text-muted-foreground">Used by inventory, POS, and the ecommerce catalogue.</span>
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
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-card p-3">
                    <p className="text-xs text-muted-foreground">Sell</p>
                    <p className="font-semibold">{formatCurrency(draft.price)}</p>
                  </div>
                  <div className="rounded-lg bg-card p-3">
                    <p className="text-xs text-muted-foreground">Stock</p>
                    <p className="font-semibold">{draft.stock} units</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border p-5">
            <Button variant="secondary" className="rounded-lg" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button className="rounded-lg" onClick={addItem} disabled={!draft.name || !draft.sku}>Create item master</Button>
          </div>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/50 p-3">
          {views.map((item) => (
            <button
              key={item}
              onClick={() => setView(item)}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                view === item ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-card hover:text-foreground",
              )}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="grid gap-3 border-b border-border p-3 xl:grid-cols-[1fr_150px_170px_170px_auto]">
          <label className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search SKU, part, fitment, supplier, bin, or movement note" className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-accent" />
          </label>
          <select value={brand} onChange={(event) => setBrand(event.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            {brands.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select value={condition} onChange={(event) => setCondition(event.target.value as typeof condition)} className="h-10 rounded-lg border border-border bg-background px-3 text-sm">
            {conditions.map((item) => <option key={item}>{item}</option>)}
          </select>
          <Button variant="outline" className="rounded-lg">
            <SlidersHorizontal className="h-4 w-4" />
            More filters
          </Button>
        </div>

        {selectedCount > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-accent/10 px-4 py-3 text-sm">
            <span className="font-medium">{selectedCount} item{selectedCount === 1 ? "" : "s"} selected</span>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Purchase order drafted", `${selectedCount} item${selectedCount === 1 ? "" : "s"} queued for the suppliers desk.`)}
              >
                Create PO
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success("Stock adjusted", `Counts updated for ${selectedCount} selected SKUs.`)}
              >
                Adjust stock
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.info("Labels queued", `Sent ${selectedCount} bin labels to the warehouse printer.`)}
              >
                Print labels
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>Clear</Button>
            </div>
          </div>
        ) : null}

        <div className="divide-y divide-border md:hidden">
          {filtered.map((item) => {
            const health = stockHealth(item);
            const selected = selectedIds.includes(item.id);
            return (
              <article key={`mobile-${item.id}`} className={cn("p-4", selected && "bg-secondary/50")}>
                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={selected} onChange={() => toggleSelected(item.id)} className="mt-1 h-4 w-4 rounded border-border" />
                  <img src={item.image} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge tone={health.tone} dot>{health.label}</Badge>
                      <Badge tone="ink">ABC {item.velocity}</Badge>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold leading-tight">{item.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{item.sku} - {item.condition}</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-lg bg-background p-3">
                    <p className="text-xs text-muted-foreground">Available</p>
                    <p className="font-semibold">{item.available} units</p>
                    <p className="text-xs text-muted-foreground">{item.reserved} reserved</p>
                  </div>
                  <div className="rounded-lg bg-background p-3">
                    <p className="text-xs text-muted-foreground">Reorder</p>
                    <p className={cn("font-semibold", item.stock <= item.reorderAt && "text-destructive")}>Min {item.reorderAt}</p>
                    <p className="text-xs text-muted-foreground">{item.daysCover === 999 ? "No sales" : `${item.daysCover} days cover`}</p>
                  </div>
                  <div className="rounded-lg bg-background p-3">
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-semibold">{formatCurrency(item.price)}</p>
                    <p className="text-xs text-muted-foreground">{item.margin}% margin</p>
                  </div>
                  <div className="rounded-lg bg-background p-3">
                    <p className="text-xs text-muted-foreground">Bin</p>
                    <p className="font-semibold">{item.location}</p>
                    <p className="truncate text-xs text-muted-foreground">{item.supplier}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{item.brand} {item.model} - {item.compatibility}</p>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingId(editingId === item.id ? null : item.id)}>Edit</Button>
                  <Button size="sm" onClick={() => receiveStock(item)}>Receive</Button>
                  <Button variant="danger" size="sm" onClick={() => deleteItem(item)}>Delete</Button>
                </div>
                {editingId === item.id ? (
                  <div className="mt-3 grid gap-2 rounded-lg border border-border bg-background p-3">
                    <input value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} className="h-9 rounded-lg border border-border bg-card px-3 text-sm" />
                    <input value={item.sku} onChange={(event) => updateItem(item.id, { sku: event.target.value })} className="h-9 rounded-lg border border-border bg-card px-3 text-sm" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" value={item.price} onChange={(event) => updateItem(item.id, { price: Number(event.target.value) })} className="h-9 rounded-lg border border-border bg-card px-3 text-sm" />
                      <input type="number" value={item.stock} onChange={(event) => updateItem(item.id, { stock: Number(event.target.value) })} className="h-9 rounded-lg border border-border bg-card px-3 text-sm" />
                    </div>
                    <Button variant="secondary" size="sm" onClick={saveInline}>Save changes</Button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[1320px] text-left text-sm">
            <thead className="bg-secondary/70 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" checked={filtered.length > 0 && selectedIds.length === filtered.length} onChange={toggleAllFiltered} className="h-4 w-4 rounded border-border" />
                </th>
                <th className="px-4 py-3">Item master</th>
                <th className="px-4 py-3">Fitment</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-4 py-3">Reorder</th>
                <th className="px-4 py-3">Commercials</th>
                <th className="px-4 py-3">Supplier / bin</th>
                <th className="px-4 py-3">Last movement</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => {
                const health = stockHealth(item);
                const editing = editingId === item.id;
                const selected = selectedIds.includes(item.id);
                return (
                  <Fragment key={item.id}>
                    <tr className={cn("align-top transition hover:bg-secondary/35", selected && "bg-secondary/50")}>
                      <td className="px-4 py-4">
                        <input type="checkbox" checked={selected} onChange={() => toggleSelected(item.id)} className="h-4 w-4 rounded border-border" />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-3">
                          <img src={item.image} alt="" className="h-16 w-20 rounded-lg object-cover" />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold text-foreground">{item.name}</p>
                              <Badge tone={health.tone} dot>{health.label}</Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">{item.sku} - {item.category} - {item.condition}</p>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <Badge tone="ink">ABC {item.velocity}</Badge>
                              <Badge tone={item.daysCover < 14 ? "rust" : item.daysCover < 30 ? "amber" : "neutral"}>{item.daysCover === 999 ? "No sales" : `${item.daysCover} days cover`}</Badge>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium">{item.brand} {item.model}</p>
                        <p className="mt-1 max-w-[240px] text-xs text-muted-foreground">{item.compatibility}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold">{item.available} available</p>
                        <p className="text-xs text-muted-foreground">{item.stock} on hand - {item.reserved} reserved</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.onOrder} on reorder plan</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className={cn("font-semibold", item.stock <= item.reorderAt && "text-destructive")}>Min {item.reorderAt}</p>
                        <p className="text-xs text-muted-foreground">Monthly sales {item.monthlySales}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-semibold">{formatCurrency(item.price)}</p>
                        <p className="text-xs text-muted-foreground">Cost {formatCurrency(item.cost)}</p>
                        <p className={cn("mt-1 text-xs font-semibold", item.margin >= 35 ? "text-success" : "text-warning")}>{item.margin}% margin</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium">{item.supplier}</p>
                        <p className="text-xs text-muted-foreground">Bin {item.location}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="max-w-[220px] text-xs text-muted-foreground">{item.lastMovement}</p>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingId(editing ? null : item.id)}>
                            <Pencil className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button size="sm" onClick={() => receiveStock(item)}>
                            <PackagePlus className="h-4 w-4" />
                            Receive
                          </Button>
                          <Button variant="danger" size="sm" onClick={() => deleteItem(item)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {editing ? (
                      <tr key={`${item.id}-edit`} className="bg-secondary/30">
                        <td colSpan={9} className="px-4 py-4">
                          <div className="grid gap-2 xl:grid-cols-[1.2fr_120px_1fr_130px_110px_110px_140px_auto]">
                            <input value={item.name} onChange={(event) => updateItem(item.id, { name: event.target.value })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                            <input value={item.sku} onChange={(event) => updateItem(item.id, { sku: event.target.value })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                            <input value={item.model} onChange={(event) => updateItem(item.id, { model: event.target.value })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                            <input type="number" value={item.price} onChange={(event) => updateItem(item.id, { price: Number(event.target.value) })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                            <input type="number" value={item.cost} onChange={(event) => updateItem(item.id, { cost: Number(event.target.value) })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                            <input type="number" value={item.stock} onChange={(event) => updateItem(item.id, { stock: Number(event.target.value) })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                            <input value={item.location} onChange={(event) => updateItem(item.id, { location: event.target.value })} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
                            <Button variant="secondary" size="sm" onClick={saveInline}>Save</Button>
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

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <h3 className="font-semibold">Reorder Queue</h3>
          </div>
          <div className="mt-4 space-y-3">
            {lowStock.map((item) => (
              <div key={item.id} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.stock} left - reorder from {item.supplier}</p>
                  </div>
                  <Button size="sm" variant="outline">PO</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-accent" />
            <h3 className="font-semibold">Movement Ledger</h3>
          </div>
          <div className="mt-4 space-y-3">
            {stockMovements.map((event) => (
              <div key={`${event.item}-${event.time}`} className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium">{event.item}</p>
                  <p className="text-xs text-muted-foreground">{event.type} - {event.staff} - {event.time}</p>
                </div>
                <span className={cn("font-semibold", event.qty > 0 ? "text-success" : "text-destructive")}>
                  {event.qty > 0 ? "+" : ""}{event.qty}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-accent" />
            <h3 className="font-semibold">Supplier Health</h3>
          </div>
          <div className="mt-4 space-y-3">
            {suppliers.map((supplier) => (
              <div key={supplier.name} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{supplier.name}</p>
                    <p className="text-xs text-muted-foreground">{supplier.openOrders} open orders - {supplier.leadTime} lead time</p>
                  </div>
                  <Badge tone="leaf">{supplier.reliability}</Badge>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
