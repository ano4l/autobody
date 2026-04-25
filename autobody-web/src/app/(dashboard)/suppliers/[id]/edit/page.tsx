"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { Supplier } from "@/lib/types";
import { PageShell } from "@/components/shell/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { IconArrowLeft } from "@/components/ui/icons";

type FormState = {
  name: string;
  contactName: string;
  phone: string;
  email: string;
  leadTimeDays: string;
  notes: string;
};

const emptyForm: FormState = {
  name: "",
  contactName: "",
  phone: "",
  email: "",
  leadTimeDays: "",
  notes: "",
};

export default function EditSupplierPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(params.id);

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    let cancelled = false;
    setLoading(true);
    api
      .get<Supplier>(`/api/suppliers/${id}`)
      .then((s) => {
        if (cancelled) return;
        setSupplier(s);
        setForm({
          name: s.name ?? "",
          contactName: s.contactName ?? "",
          phone: s.phone ?? "",
          email: s.email ?? "",
          leadTimeDays: s.leadTimeDays?.toString() ?? "",
          notes: s.notes ?? "",
        });
      })
      .catch((e) => {
        if (!cancelled) setErr(e instanceof Error ? e.message : "Failed to load supplier");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
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
        contactName: form.contactName.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        leadTimeDays: form.leadTimeDays ? Number(form.leadTimeDays) : null,
        notes: form.notes.trim() || null,
      };
      const updated = await api.put<Supplier>(`/api/suppliers/${id}`, payload);
      setSupplier(updated);
      setMsg("Changes saved.");
    } catch (e) {
      setErr(e instanceof ApiError || e instanceof Error ? e.message : "Failed to save supplier");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async () => {
    if (
      !confirm(
        "Delete this supplier permanently? Parts that reference this supplier must be unlinked first — otherwise the delete will fail.",
      )
    )
      return;
    setDeleting(true);
    setErr(null);
    setMsg(null);
    try {
      await api.del<void>(`/api/suppliers/${id}`);
      router.push("/suppliers");
    } catch (e) {
      setErr(e instanceof ApiError || e instanceof Error ? e.message : "Failed to delete supplier");
      setDeleting(false);
    }
  };

  return (
    <PageShell
      title={supplier ? supplier.name : "Edit supplier"}
      description={supplier ? "Update vendor contact details and lead time." : "Loading…"}
      actions={
        <Link href="/suppliers" className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900">
          <IconArrowLeft className="h-4 w-4" />
          Back to suppliers
        </Link>
      }
    >
      {loading ? (
        <Card>
          <CardContent className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : !supplier ? (
        <Card>
          <CardContent className="p-6 text-sm text-ink-600">Supplier not found.</CardContent>
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

              <Field label="Name">
                <Input
                  required
                  maxLength={150}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </Field>

              <section className="grid gap-4 md:grid-cols-2">
                <Field label="Contact name">
                  <Input
                    maxLength={100}
                    value={form.contactName}
                    onChange={(e) => update("contactName", e.target.value)}
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    maxLength={30}
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </Field>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <Field label="Email">
                  <Input
                    type="email"
                    maxLength={150}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </Field>
                <Field label="Lead time (days)" hint="Typical days from order to delivery.">
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    value={form.leadTimeDays}
                    onChange={(e) => update("leadTimeDays", e.target.value)}
                  />
                </Field>
              </section>

              <Field label="Notes">
                <Textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </Field>
            </CardContent>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-cream-200 px-6 py-4">
              <Button type="button" variant="danger" onClick={remove} loading={deleting}>
                Delete supplier
              </Button>
              <div className="flex items-center gap-3">
                <Link href="/suppliers">
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
