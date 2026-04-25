"use client";

import { useState } from "react";
import { Megaphone, Send, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const history = [
  { title: "Weekend bumper clearance", audience: "Business WhatsApp group", sent: "24 Apr 2026 08:00", reach: "312 delivered" },
  { title: "New Ranger tail light stock", audience: "Panelbeaters", sent: "22 Apr 2026 13:20", reach: "86 delivered" },
  { title: "OEM lighting arrivals", audience: "Resellers", sent: "19 Apr 2026 09:10", reach: "144 delivered" },
];

export function BroadcastSection() {
  const [title, setTitle] = useState("Toyota Corolla bumper stock just landed");
  const [message, setMessage] = useState("Fresh aftermarket front bumpers available today. Reply with vehicle year and colour prep requirements for a fast quote.");
  const [sent, setSent] = useState(false);

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Broadcast Tool</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Post deals and stock alerts to the business WhatsApp group from the dashboard.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-accent" />
            <h3 className="font-semibold">Create Promotion</h3>
          </div>
          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Campaign title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent" />
            </label>
            <label className="block">
              <span className="text-sm font-medium">WhatsApp message</span>
              <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={6} className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent" />
            </label>
            <div className="flex flex-wrap gap-2">
              {["Business group", "Panelbeaters", "Resellers", "VIP workshops"].map((audience) => (
                <Badge key={audience} tone={audience === "Business group" ? "ink" : "neutral"}>{audience}</Badge>
              ))}
            </div>
            <Button className="rounded-lg" onClick={() => setSent(true)}>
              <Send className="h-4 w-4" />
              Post to WhatsApp Group
            </Button>
            {sent ? <p className="text-sm font-medium text-success">Demo broadcast queued and marked as delivered.</p> : null}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="font-semibold">Recent Broadcasts</h3>
          <div className="mt-4 divide-y divide-border">
            {history.map((item) => (
              <div key={item.title} className="grid gap-2 py-3 md:grid-cols-[1fr_180px_130px]">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.sent}</p>
                <p className="text-sm text-muted-foreground">{item.reach}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-success" />
          <h3 className="font-semibold">WhatsApp Preview</h3>
        </div>
        <div className="rounded-2xl bg-[#e7ffdb] p-4 text-sm text-[#143d22] shadow-inner">
          <p className="font-semibold">{title}</p>
          <p className="mt-3 leading-6">{message}</p>
          <p className="mt-4 text-right text-[11px] text-[#52745b]">Today 09:45 ✓✓</p>
        </div>
      </aside>
    </div>
  );
}
