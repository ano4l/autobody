"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { PagedResponse, Part, Supplier } from "@/lib/types";
import { PageShell } from "@/components/shell/page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { IconArrowLeft } from "@/components/ui/icons";

type FormState = {
  name: string;
  category: string;
  make: string;
  model: string;
  yearRangeStart: string;
  yearRangeEnd: string;
  lowStockThreshold: string;
  costPrice: string;
  sellPrice: string;
  location: string;
  supplierId: string;
};

const emptyForm: FormState = {
  name: "",
  category: "",
  make: "",
  model: "",
  yearRangeStart: "",
  yearRangeEnd: "",
  lowStockThreshold: "",
  costPrice: "",
  sellPrice: "",
  location: "",
  supplierId: "",
};

export default function EditPartPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const [part, setPart] = useState<Part | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busy, setBusy] = useState<"deactivate" | "reactivate" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.get<Part>(`/api/parts/${id}`),
      api.get<PagedResponse<Supplier>>("/api/suppliers", { query: { size: 200 } }).catch(() => ({
        items: [] as Supplier[], page: 0, size: 0, total: 0, totalPages: 0,
      })),
    ])
      .then(([p, s]) => {
        if (cancelled) return;
        setPart(p);
        setSuppliers(s.items);
        setForm({
          name: p.name ?? "",
          category: p.category ?? "",
          make: p.make ?? "",
          model: p.model ?? "",
          yearRangeStart: p.yearRangeStart?.toString() ?? "",
          yearRangeEnd: p.yearRangeEnd?.toString() ?? "",
          lowStockThreshold: p.lowStockThreshold?.toString() ?? "",
          costPrice: p.costPrice?.toString() ?? "",
          sellPrice: p.sellPrice?.toString() ?? "",
          location: p.location ?? "",
          supplierId: p.supplierId?.toString() ?? "",
        });
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load part");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        category: form.category.trim() || null,
        make: form.make.trim() || null,
        model: form.model.trim() || null,
        yearRangeStart: form.yearRangeStart ? Number(form.yearRangeStart) : null,
        yearRangeEnd: form.yearRangeEnd ? Number(form.yearRangeEnd) : null,
        lowStockThreshold: form.lowStockThreshold ? Number(form.lowStockThreshold) : null,
        costPrice: form.costPrice ? Number(form.costPrice) : null,
        sellPrice: form.sellPrice ? Number(form.sellPrice) : null,
        location: form.location.trim() || null,
        supplierId: form.supplierId ? Number(form.supplierId) : null,
      };
      const updated = await api.put<Part>(`/api/parts/${id}`, payload);
      setPart(updated);
      setMsg("Changes saved.");
    } catch (e) {
      setErr(e instanceof ApiError || e instanceof Error ? e.message : "Failed to save part");
    } finally {
      setSubmitting(false);
    }
  };

  const deactivate = async () => {
    if (!confirm("Deactivate this part? It will stop appearing in active searches but history is preserved.")) return;
    setBusy("deactivate");
    setErr(null);
    setMsg(null);
    try {
      await api.del<void>(`/api/parts/${id}`);
      const refreshed = await api.get<Part>(`/api/parts/${id}`);
      setPart(refreshed);
      setMsg("Part deactivated.");
    } catch (e) {
      setErr(e instanceof ApiError || e instanceof Error ? e.message : "Failed to deactivate");
    } finally {
      setBusy(null);
    }
  };

  const reactivate = async () => {
    setBusy("reactivate");
    setErr(null);
    setMsg(null);
    try {
      const updated = await api.put<Part>(`/api/parts/${id}`, { active: true });
      setPart(updated);
      setMsg("Part reactivated.");
    } catch (e) {
      setErr(e instanceof ApiError || e instanceof Error ? e.message : "Failed to reactivate");
    } finally {
      setBusy(null);
    }
  };

  return (
    <PageShell
      title={part ? part.name : "Edit part"}
      description={part ? `SKU · ${part.sku}` : "Loading…"}
      actions={
        <Link href="/inventory" className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900">
          <IconArrowLeft className="h-4 w-4" />
          Back to inventory
        </Link>
      }
    >
      {loading ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : !part ? (
        <Card>
          <CardContent className="p-6 text-sm text-ink-600">Part not found.</CardContent>
        </Card>
      ) : (
        <form onSubmit={submit}>
          <Card>
            <CardContent className="space-y-6 p-6">
              {err ? (
                <div className="rounded-md border border-rust-500/30 bg-rust-50 px-3 py-2 text-xs text-rust-600">
                  {err}
                </div>
              ) : null}
              {msg ? (
                <div className="rounded-md border border-leaf-500/30 bg-leaf-50 px-3 py-2 text-xs text-leaf-600">
                  {msg}
                </div>
              ) : null}

              <div className="flex items-center gap-3">
                <Badge tone={part.active ? "leaf" : "neutral"} dot>
                  {part.active ? "Active" : "Inactive"}
                </Badge>
                <span className="text-xs text-ink-500">
                  On hand: <span className="font-medium text-ink-700">{part.qtyOnHand}</span> · Stock is adjusted via stock-movement entries, not this form.
                </span>
              </div>

              <section className="grid gap-4 md:grid-cols-2">
                <Field label="SKU" hint="Immutable after creation.">
                  <Input value={part.sku} readOnly disabled />
                </Field>
                <Field label="Name">
                  <Input
                    required
                    maxLength={200}
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                  />
                </Field>
              </section>

              <section className="grid gap-4 md:grid-cols-3">
                <Field label="Category">
                  <Input maxLength={100} value={form.category} onChange={(e) => update("category", e.target.value)} />
                </Field>
                <Field label="Make">
                  <Input maxLength={80} value={form.make} onChange={(e) => update("make", e.target.value)} />
                </Field>
                <Field label="Model">
                  <Input maxLength={80} value={form.model} onChange={(e) => update("model", e.target.value)} />
                </Field>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <Field label="Year — from">
                  <Input type="number" inputMode="numeric" value={form.yearRangeStart} onChange={(e) => update("yearRangeStart", e.target.value)} />
                </Field>
                <Field label="Year — to">
                  <Input type="number" inputMode="numeric" value={form.yearRangeEnd} onChange={(e) => update("yearRangeEnd", e.target.value)} />
                </Field>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <Field label="Low-stock threshold">
                  <Input type="number" inputMode="numeric" min={0} value={form.lowStockThreshold} onChange={(e) => update("lowStockThreshold", e.target.value)} />
                </Field>
                <Field label="Location">
                  <Input maxLength={80} value={form.location} onChange={(e) => update("location", e.target.value)} />
                </Field>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <Field label="Cost price">
                  <Input type="number" inputMode="decimal" step="0.01" min={0} value={form.costPrice} onChange={(e) => update("costPrice", e.target.value)} />
                </Field>
                <Field label="Sell price">
                  <Input type="number" inputMode="decimal" step="0.01" min={0} value={form.sellPrice} onChange={(e) => update("sellPrice", e.target.value)} />
                </Field>
              </section>

              <section>
                <Field label="Supplier">
                  <Select value={form.supplierId} onChange={(e) => update("supplierId", e.target.value)}>
                    <option value="">— No supplier —</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              </section>
            </CardContent>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 px-6 py-4">
              <div className="flex items-center gap-2">
                {part.active ? (
                  <Button
                    type="button"
                    variant="danger"
                    onClick={deactivate}
                    loading={busy === "deactivate"}
                  >
                    Deactivate part
                  </Button>
                ) : (
                  <Button type="button" variant="ghost" onClick={reactivate} loading={busy === "reactivate"}>
                    Reactivate part
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Link href="/inventory">
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" loading={submitting}>
                  Save changes
                </Button>
              </div>
            </div>
          </Card>
        </form>
      )}
    </PageShell>
  );
}
