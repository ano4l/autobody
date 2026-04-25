"use client";

import { ClipboardCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { inventoryItems, suppliers } from "@/lib/autobody-ops-demo-data";

export function SuppliersSection() {
  const reorderItems = inventoryItems.filter((item) => item.stock <= item.reorderAt);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Supplier Management</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Track supplier reliability, purchase orders, and reorder requirements.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {suppliers.map((supplier) => (
          <article key={supplier.name} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold">{supplier.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{supplier.contact}</p>
              </div>
              <Badge tone="leaf">{supplier.reliability}</Badge>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <span className="rounded-lg bg-secondary p-3">Lead time<br /><b>{supplier.leadTime}</b></span>
              <span className="rounded-lg bg-secondary p-3">Open POs<br /><b>{supplier.openOrders}</b></span>
            </div>
            <Button variant="outline" size="sm" className="mt-5 rounded-lg">
              <Truck className="h-4 w-4" />
              Create purchase order
            </Button>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-accent" />
          <h3 className="font-semibold">Reorder Tracking</h3>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="py-3">Part</th>
                <th>SKU</th>
                <th>Supplier</th>
                <th>Stock</th>
                <th>Suggested PO</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reorderItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 font-medium">{item.name}</td>
                  <td>{item.sku}</td>
                  <td>{item.supplier}</td>
                  <td>{item.stock} / reorder at {item.reorderAt}</td>
                  <td>{Math.max(8, item.monthlySales - item.stock)} units</td>
                  <td><Badge tone="amber">Draft PO</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
