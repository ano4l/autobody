"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { AuthUser, Role } from "@/lib/types";
import { PageShell } from "@/components/shell/page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { IconArrowLeft } from "@/components/ui/icons";

const roles: { value: Role; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "SALESPERSON", label: "Salesperson" },
  { value: "WAREHOUSE", label: "Warehouse" },
  { value: "VIEW_ONLY", label: "View only" },
];

type FormState = {
  name: string;
  role: Role;
  active: boolean;
  password: string;
};

export default function EditUserPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const [user, setUser] = useState<AuthUser | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setErr(null);
    api.get<AuthUser>(`/api/users/${id}`)
      .then((u) => {
        setUser(u);
        setForm({ name: u.name ?? "", role: u.role, active: u.active, password: "" });
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 403) {
          setErr("You need admin permissions to edit users.");
        } else {
          setErr(e instanceof Error ? e.message : "Failed to load user");
        }
      });
  }, [id]);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => (f ? { ...f, [key]: value } : f));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setErr(null);
    setMsg(null);
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        role: form.role,
        active: form.active,
      };
      if (form.password) payload.password = form.password;
      const updated = await api.put<AuthUser>(`/api/users/${id}`, payload);
      setUser(updated);
      setForm({ name: updated.name ?? "", role: updated.role, active: updated.active, password: "" });
      setMsg("User updated.");
    } catch (e) {
      setErr(e instanceof ApiError || e instanceof Error ? e.message : "Failed to update user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell
      title={user ? `Edit ${user.name || user.email}` : "Edit user"}
      description="Change role, deactivate the account, or reset the password."
      actions={
        <Link href="/users" className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900">
          <IconArrowLeft className="h-4 w-4" />
          Back to users
        </Link>
      }
    >
      {!form ? (
        <Card>
          <CardContent className="space-y-3 p-6">
            {err ? (
              <p className="text-sm text-rust-600">{err}</p>
            ) : (
              <>
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-1/2" />
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={submit} className="mx-auto max-w-2xl">
          <Card>
            <CardContent className="space-y-6 p-6">
              {msg ? (
                <div className="rounded-md border border-leaf-500/30 bg-leaf-50 px-3 py-2 text-xs text-leaf-600">
                  {msg}
                </div>
              ) : null}
              {err ? (
                <div className="rounded-md border border-rust-500/30 bg-rust-50 px-3 py-2 text-xs text-rust-600">
                  {err}
                </div>
              ) : null}

              <Field label="Email" hint="Email cannot be changed.">
                <Input value={user?.email ?? ""} disabled />
              </Field>

              <Field label="Full name">
                <Input
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </Field>

              <Field label="Role">
                <Select value={form.role} onChange={(e) => update("role", e.target.value as Role)}>
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="New password" hint="Leave blank to keep the current password. Minimum 8 characters.">
                <Input
                  type="password"
                  minLength={8}
                  maxLength={100}
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder="••••••••"
                />
              </Field>

              <label className="flex items-center gap-2.5 rounded-md border border-cream-300 bg-cream-50 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => update("active", e.target.checked)}
                  className="h-4 w-4 accent-clay-500"
                />
                <span className="text-sm text-ink-800">Account active</span>
                <span className="ml-auto text-xs text-ink-500">
                  {form.active ? "Can sign in" : "Sign-in disabled"}
                </span>
              </label>
            </CardContent>

            <div className="flex items-center justify-end gap-3 border-t border-cream-200 px-6 py-4">
              <Link href="/users">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={submitting}>
                Save changes
              </Button>
            </div>
          </Card>
        </form>
      )}
    </PageShell>
  );
}
