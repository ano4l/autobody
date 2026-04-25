import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "clay" | "leaf" | "amber" | "rust" | "ink";
}

const accents: Record<NonNullable<StatCardProps["tone"]>, string> = {
  clay: "text-clay-600",
  leaf: "text-leaf-600",
  amber: "text-amber-600",
  rust: "text-rust-600",
  ink: "text-ink-900",
};

export function StatCard({ label, value, hint, tone = "ink" }: StatCardProps) {
  return (
    <Card className="p-5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-ink-500">{label}</p>
      <p className={cn("mt-2 font-serif text-display-sm", accents[tone])}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink-600">{hint}</p> : null}
    </Card>
  );
}
