"use client";

import type { ElementType } from "react";
import { useMemo, useState } from "react";
import {
  Banknote,
  Barcode,
  CreditCard,
  FileText,
  Minus,
  Plus,
  ReceiptText,
  Search,
  ShieldCheck,
  Smartphone,
  Trash2,
  UserRoundPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { inventoryItems, type InventoryItem } from "@/lib/autobody-ops-demo-data";
import { cn } from "@/lib/utils";

type CartItem = InventoryItem & { quantity: number };
type Payment = "Cash" | "Card" | "EFT";

const paymentOptions: { id: Payment; icon: ElementType; label: string }[] = [
  { id: "Cash", icon: Banknote, label: "Cash" },
  { id: "Card", icon: CreditCard, label: "Card" },
  { id: "EFT", icon: Smartphone, label: "EFT" },
];

export function PosSection() {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [payment, setPayment] = useState<Payment>("Card");
  const [lastSale, setLastSale] = useState<string | null>("FS-1048");
  const [captureDetails, setCaptureDetails] = useState(true);
  const [customer, setCustomer] = useState({ name: "", phone: "", vehicle: "", vin: "", notes: "" });

  const products = useMemo(() => {
    const needle = query.toLowerCase();
    return inventoryItems.filter((item) =>
      [item.name, item.sku, item.brand, item.model, item.compatibility, item.condition].join(" ").toLowerCase().includes(needle),
    );
  }, [query]);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const vat = subtotal * 0.15;
  const total = subtotal + vat;
  const cartUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
  const stockReserved = cart.reduce((sum, item) => sum + item.cost * item.quantity, 0);

  const add = (item: InventoryItem) => {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: Math.min(cartItem.quantity + 1, item.stock) } : cartItem,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const changeQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev.flatMap((item) => {
        if (item.id !== id) return item;
        const quantity = item.quantity + delta;
        return quantity <= 0 ? [] : [{ ...item, quantity: Math.min(quantity, item.stock) }];
      }),
    );
  };

  const completeSale = () => {
    if (cart.length === 0) return;
    setLastSale(`FS-${Math.floor(1100 + Math.random() * 800)}`);
    setCart([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">POS Terminal</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Corporate walk-in sales terminal with stock validation, customer capture, quote hold, and receipt preview.
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-4 xl:min-w-[680px]">
          {[
            ["Terminal", "JHB-01"],
            ["Cashier", "Jan Ferreira"],
            ["Receipt", lastSale ?? "Pending"],
            ["Cart", `${cartUnits} units`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 text-sm font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1fr_460px]">
        <section className="space-y-4">
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="grid gap-3 border-b border-border p-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Scan barcode or search SKU, part, make, model, condition"
                  className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-accent"
                />
              </label>
              <Button variant="outline" className="rounded-lg">
                <Barcode className="h-4 w-4" />
                Scan Item
              </Button>
              <Button variant="secondary" className="rounded-lg">
                <FileText className="h-4 w-4" />
                Quote Hold
              </Button>
            </div>

            <div className="grid gap-px bg-border overflow-hidden rounded-b-xl">
              <div className="hidden grid-cols-[1.3fr_1fr_130px_120px_110px] bg-secondary/80 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground lg:grid">
                <span>Item</span>
                <span>Fitment</span>
                <span>Stock</span>
                <span>Price</span>
                <span className="text-right">Action</span>
              </div>
              {products.map((item) => {
                const low = item.stock <= item.reorderAt;
                return (
                  <article key={item.id} className="grid gap-4 bg-card p-4 lg:grid-cols-[1.3fr_1fr_130px_120px_110px] lg:items-center">
                    <div className="flex min-w-0 gap-3">
                      <img src={item.image} alt="" className="h-20 w-24 shrink-0 rounded-lg object-cover" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold leading-tight">{item.name}</h3>
                          <Badge tone={item.condition === "OEM" ? "clay" : "neutral"}>{item.condition}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{item.sku} - {item.category}</p>
                        <p className="mt-2 text-xs text-muted-foreground">Supplier: {item.supplier}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.brand} {item.model}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.compatibility}</p>
                      <p className="mt-2 text-xs text-muted-foreground">Bin {item.location}</p>
                    </div>
                    <div>
                      <Badge tone={low ? "rust" : "leaf"} dot>{item.stock} available</Badge>
                      <p className="mt-2 text-xs text-muted-foreground">Reorder at {item.reorderAt}</p>
                    </div>
                    <p className="text-lg font-semibold">R {item.price.toLocaleString("en-ZA")}</p>
                    <div className="flex justify-end">
                      <Button size="sm" className="rounded-lg" onClick={() => add(item)} disabled={item.stock <= 0}>
                        <Plus className="h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="space-y-4 2xl:sticky 2xl:top-20 2xl:self-start">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold">Current Sale</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">{cart.length} SKUs selected</p>
              </div>
              <Badge tone={captureDetails ? "leaf" : "ink"} dot>
                {captureDetails ? "Details open" : "Walk-in"}
              </Badge>
            </div>

            <button
              onClick={() => setCaptureDetails((value) => !value)}
              className="mt-4 flex w-full items-center justify-between rounded-lg border border-border bg-secondary/60 px-3 py-2 text-sm transition hover:bg-secondary"
            >
              <span className="flex items-center gap-2 font-medium">
                <UserRoundPlus className="h-4 w-4 text-accent" />
                Capture customer and vehicle details
              </span>
              <span className="text-xs text-muted-foreground">{captureDetails ? "Hide" : "Open"}</span>
            </button>

            {captureDetails ? (
              <div className="mt-3 grid gap-2 rounded-lg border border-border bg-background p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <input value={customer.name} onChange={(event) => setCustomer({ ...customer, name: event.target.value })} placeholder="Customer name" className="h-9 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                  <input value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} placeholder="Phone / WhatsApp" className="h-9 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                </div>
                <input value={customer.vehicle} onChange={(event) => setCustomer({ ...customer, vehicle: event.target.value })} placeholder="Vehicle make, model, year" className="h-9 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                <input value={customer.vin} onChange={(event) => setCustomer({ ...customer, vin: event.target.value })} placeholder="VIN / registration number" className="h-9 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-accent" />
                <textarea value={customer.notes} onChange={(event) => setCustomer({ ...customer, notes: event.target.value })} placeholder="Fitment notes, colour, delivery request, quote reference" rows={3} className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:border-accent" />
              </div>
            ) : null}

            <div className="mt-4 min-h-44 space-y-3">
              {cart.length === 0 ? (
                <div className="grid min-h-40 place-items-center rounded-lg border border-dashed border-border bg-background text-center text-sm text-muted-foreground">
                  Scan or add parts to begin a sale
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.sku} - R {item.price.toLocaleString("en-ZA")} each</p>
                      </div>
                      <button onClick={() => changeQty(item.id, -item.quantity)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" size="icon" className="h-7 w-7 rounded-lg" onClick={() => changeQty(item.id, -1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                        <Button variant="secondary" size="icon" className="h-7 w-7 rounded-lg" onClick={() => changeQty(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-semibold">R {(item.price * item.quantity).toLocaleString("en-ZA")}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2">
              {paymentOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setPayment(option.id)}
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm transition",
                      payment === option.id ? "border-accent bg-accent/10 text-foreground" : "border-border text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    <Icon className="mx-auto mb-1 h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>R {subtotal.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">VAT 15%</span><span>R {vat.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Stock cost reserved</span><span>R {stockReserved.toLocaleString("en-ZA")}</span></div>
              <div className="flex justify-between text-lg font-semibold"><span>Total due</span><span>R {total.toLocaleString("en-ZA", { maximumFractionDigits: 2 })}</span></div>
            </div>

            <Button className="mt-5 w-full rounded-lg" onClick={completeSale} disabled={cart.length === 0}>
              <ReceiptText className="h-4 w-4" />
              Complete Sale & Generate PDF Receipt
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success" />
              <h3 className="font-semibold">Receipt Preview</h3>
            </div>
            <div className="mt-4 rounded-lg bg-background p-4 font-mono text-xs leading-6">
              <p>FERREIRA&apos;S AUTOBODY SPARES</p>
              <p>Receipt: {lastSale ?? "Pending"}</p>
              <p>Payment: {payment}</p>
              {captureDetails && customer.name ? <p>Customer: {customer.name}</p> : null}
              {captureDetails && customer.vehicle ? <p>Vehicle: {customer.vehicle}</p> : null}
              <p className="my-2 border-t border-border" />
              {cart.length === 0 ? <p>No active items</p> : cart.map((item) => <p key={item.id}>{item.quantity}x {item.sku} R{(item.price * item.quantity).toFixed(2)}</p>)}
              <p className="my-2 border-t border-border" />
              <p>TOTAL R{total.toFixed(2)}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
