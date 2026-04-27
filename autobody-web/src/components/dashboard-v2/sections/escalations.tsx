"use client";

import { useState } from "react";
import { AlertTriangle, MessageCircle, PhoneCall, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/lib/toast";

const escalations = [
  { id: "ESC-204", customer: "Mandla Dlamini", vehicle: "VW Polo 2021", issue: "Bot could not confirm left/right headlight fitment.", priority: "Urgent", age: "8 min", owner: "Unassigned" },
  { id: "ESC-199", customer: "AutoFix Panelbeaters", vehicle: "Toyota Corolla Quest", issue: "Bulk quote requested for six bumpers and three bonnets.", priority: "High", age: "24 min", owner: "Nadia" },
  { id: "ESC-187", customer: "Riaan Jacobs", vehicle: "Ford Ranger 2019", issue: "Customer sent accident photos and needs same-day availability.", priority: "High", age: "41 min", owner: "Jan" },
];

export function EscalationsSection() {
  const [claimed, setClaimed] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Escalation Queue</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Flagged WhatsApp conversations that need urgent human attention.
          </p>
        </div>
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {escalations.length} active escalations · oldest waiting 41 min
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {escalations.map((item) => {
          const isClaimed = claimed.includes(item.id);
          return (
            <article key={item.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{item.id}</p>
                  <h3 className="mt-1 font-semibold">{item.customer}</h3>
                </div>
                <Badge tone={item.priority === "Urgent" ? "rust" : "amber"} dot>{item.priority}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{item.vehicle}</p>
              <p className="mt-3 text-sm leading-6">{item.issue}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <span className="rounded-lg bg-secondary p-2">Waiting {item.age}</span>
                <span className="rounded-lg bg-secondary p-2">Owner: {isClaimed ? "You" : item.owner}</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <Button
                  size="sm"
                  className="rounded-lg"
                  onClick={() => {
                    if (isClaimed) {
                      toast.info("Already taken over", `${item.id} is on your queue.`);
                      return;
                    }
                    setClaimed((prev) => [...new Set([...prev, item.id])]);
                    toast.success("Escalation claimed", `${item.id} — ${item.customer} is now on your queue.`);
                  }}
                >
                  <UserCheck className="h-4 w-4" />
                  Take over
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-lg"
                  onClick={() =>
                    toast.info("Opening WhatsApp", `Routing to ${item.customer} on the conversations panel.`)
                  }
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg"
                  onClick={() =>
                    toast.info("Calling", `Dialing ${item.customer} via the desk softphone.`)
                  }
                >
                  <PhoneCall className="h-4 w-4" />
                  Call
                </Button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <h3 className="font-semibold">Bot Handover Rules</h3>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["Unknown fitment", "High-value quote", "Customer waiting more than 20 minutes"].map((rule) => (
            <div key={rule} className="rounded-lg bg-secondary/70 p-3 text-sm">{rule}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
