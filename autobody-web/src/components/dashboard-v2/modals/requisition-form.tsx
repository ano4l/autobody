"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { createDemoRequisition } from "@/lib/dashboard-seed";

interface RequisitionFormProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORIES = [
  { value: "collision_panels", label: "Collision Panels" },
  { value: "lighting", label: "Lighting" },
  { value: "brakes_suspension", label: "Brakes & Suspension" },
  { value: "wheels_tyres", label: "Wheels & Tyres" },
  { value: "engine_mechanical", label: "Engine & Mechanical" },
  { value: "body_trim", label: "Body Trim" },
  { value: "consumables", label: "Consumables" },
];

const BRANCHES = [
  { value: "pretoria", label: "Pretoria" },
  { value: "johannesburg", label: "Johannesburg" },
  { value: "cape_town", label: "Cape Town" },
  { value: "durban", label: "Durban" },
];

export function RequisitionForm({ open, onClose }: RequisitionFormProps) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [project_name, setProjectName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [branch, setBranch] = useState(BRANCHES[0].value);
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [neededBy, setNeededBy] = useState("");

  useEffect(() => {
    if (!open) {
      setStep(0);
      setSubmitting(false);
      setDone(false);
      setProjectName("");
      setCategory(CATEGORIES[0].value);
      setBranch(BRANCHES[0].value);
      setAmount("");
      setPurpose("");
      setNeededBy("");
    }
  }, [open]);

  if (!open) return null;

  async function submit() {
    setSubmitting(true);
    await createDemoRequisition({
      project_name: project_name || "New parts request",
      category,
      branch,
      amount: Number(amount) || 0,
      purpose: purpose || "Requisition",
      needed_by: neededBy ? new Date(neededBy).toISOString() : undefined,
    });
    setSubmitting(false);
    setDone(true);
    setTimeout(() => {
      onClose();
    }, 900);
  }

  const steps = ["Project", "Amount", "Justification", "Review"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-border rounded-xl w-full max-w-xl mx-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-base font-semibold text-foreground">New Requisition</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Step {step + 1} of {steps.length} — {steps[step]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <div
                key={s}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-accent" : "bg-secondary",
                )}
              />
            ))}
          </div>
        </div>

        <div className="p-6 space-y-4 min-h-[260px]">
          {done ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-success/15 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <p className="text-sm font-medium text-foreground">Submitted</p>
              <p className="text-xs text-muted-foreground">
                The requisition is now in the approval queue.
              </p>
            </div>
          ) : step === 0 ? (
            <>
              <Field label="Project / Job">
                <input
                  value={project_name}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Describe the request"
                  className="ds-input"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Branch">
                  <select value={branch} onChange={(e) => setBranch(e.target.value)} className="ds-input">
                    {BRANCHES.map((b) => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Category">
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="ds-input">
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </>
          ) : step === 1 ? (
            <>
              <Field label="Amount (ZAR)">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="ds-input"
                />
              </Field>
              <Field label="Needed By">
                <input
                  type="date"
                  value={neededBy}
                  onChange={(e) => setNeededBy(e.target.value)}
                  className="ds-input"
                />
              </Field>
            </>
          ) : step === 2 ? (
            <Field label="Business Justification">
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={5}
                placeholder="Why this part, why this supplier, customer signed-off?"
                className="ds-input"
              />
            </Field>
          ) : (
            <div className="space-y-2 text-sm">
              <Row k="Project" v={project_name || "—"} />
              <Row k="Branch" v={BRANCHES.find((b) => b.value === branch)?.label ?? branch} />
              <Row k="Category" v={CATEGORIES.find((c) => c.value === category)?.label ?? category} />
              <Row k="Amount" v={`ZAR ${Number(amount || 0).toLocaleString("en", { minimumFractionDigits: 2 })}`} />
              <Row k="Needed By" v={neededBy || "—"} />
              <Row k="Purpose" v={purpose || "—"} />
            </div>
          )}
        </div>

        {!done && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/30 rounded-b-xl">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < steps.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent/90 disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit
              </button>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        .ds-input {
          width: 100%;
          height: 2.5rem;
          background: var(--secondary);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 0 0.75rem;
          color: var(--foreground);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .ds-input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 22%, transparent);
        }
        textarea.ds-input {
          height: auto;
          padding: 0.625rem 0.75rem;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-start justify-between border-b border-border/60 pb-2">
      <span className="text-xs text-muted-foreground">{k}</span>
      <span className="text-sm text-foreground text-right max-w-[60%]">{v}</span>
    </div>
  );
}
