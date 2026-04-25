"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, MessageSquare, Clock, Phone, Mail, MessageCircle,
  ChevronDown, ChevronUp, Loader2, RefreshCw,
} from "lucide-react";
import { getConversations } from "@/lib/dashboard-autobody-seed";
import type { Conversation } from "@/lib/dashboard-autobody-seed";

const channelIcons: Record<string, React.ElementType> = {
  WHATSAPP: MessageCircle,
  SMS: MessageSquare,
  EMAIL: Mail,
  PHONE: Phone,
};

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  OPEN: { color: "text-chart-1", bg: "bg-chart-1/10", label: "Open" },
  WAITING: { color: "text-warning", bg: "bg-warning/10", label: "Waiting" },
  ESCALATED: { color: "text-destructive", bg: "bg-destructive/10", label: "Escalated" },
  RESOLVED: { color: "text-success", bg: "bg-success/10", label: "Resolved" },
};

export function ApprovalsSection() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getConversations(statusFilter === "all" ? undefined : statusFilter, page);
      setConversations(res.data ?? []);
      setLastPage(res.last_page ?? 1);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  function fmtDate(d: string) {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const openCount = conversations.filter((c) => c.status === "OPEN").length;
  const waitingCount = conversations.filter((c) => c.status === "WAITING").length;
  const escalatedCount = conversations.filter((c) => c.status === "ESCALATED").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Conversations</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            WhatsApp, SMS, email and phone enquiries
          </p>
        </div>
        <button
          onClick={load}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Open", count: openCount, color: "text-chart-1" },
          { label: "Waiting", count: waitingCount, color: "text-warning" },
          { label: "Escalated", count: escalatedCount, color: "text-destructive" },
          { label: "Total", count: conversations.length, color: "text-foreground" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <span className={cn("text-2xl font-bold", s.color)}>{s.count}</span>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 px-3 rounded-lg bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-accent"
        >
          {["all", "OPEN", "WAITING", "ESCALATED", "RESOLVED"].map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Statuses" : statusConfig[s]?.label ?? s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2 opacity-60" />
          <p className="text-sm text-muted-foreground">No conversations to display.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((convo, index) => {
            const isExpanded = expandedId === convo.id;
            const ChannelIcon = channelIcons[convo.channel] ?? MessageSquare;
            const sc = statusConfig[convo.status] ?? {
              color: "text-muted-foreground",
              bg: "bg-muted/50",
              label: convo.status,
            };

            return (
              <div
                key={convo.id}
                className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : convo.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", sc.bg)}>
                      <ChannelIcon className={cn("w-5 h-5", sc.color)} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground">
                          {convo.customerName}
                        </span>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            sc.bg,
                            sc.color,
                          )}
                        >
                          {sc.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {convo.channel} · {convo.vehicle} · Assigned to {convo.assignedTo}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">{fmtDate(convo.updatedAt)}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(
                        [
                          ["Channel", convo.channel],
                          ["Vehicle", convo.vehicle || "—"],
                          ["Assigned To", convo.assignedTo],
                          ["Updated", fmtDate(convo.updatedAt)],
                        ] as const
                      ).map(([k, v]) => (
                        <div key={k}>
                          <p className="text-xs text-muted-foreground">{k}</p>
                          <p className="text-sm font-medium text-foreground">{v}</p>
                        </div>
                      ))}
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Latest Message</p>
                      <p className="text-sm text-foreground bg-secondary rounded-lg p-3">
                        {convo.message}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => alert(`Reply to ${convo.customerName} via ${convo.channel} (demo)`)}                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" /> Reply
                      </button>
                      <button
                        onClick={() => alert(`Escalate conversation #${convo.id} (demo)`)}                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 text-warning text-sm font-medium hover:bg-warning/20 transition-colors"
                      >
                        <Clock className="w-4 h-4" /> Escalate
                      </button>
                      <button
                        onClick={() => alert(`Mark conversation #${convo.id} as resolved (demo)`)}                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Resolve
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {lastPage}
          </span>
          <button
            disabled={page >= lastPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-lg text-sm border border-border text-muted-foreground hover:text-foreground disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
