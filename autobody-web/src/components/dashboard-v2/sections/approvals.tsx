"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  CheckCircle2, MessageSquare, Clock, Phone, Mail, MessageCircle,
  ChevronDown, ChevronUp, Loader2, RefreshCw, Send, X, Inbox,
} from "lucide-react";
import { getConversations } from "@/lib/dashboard-service";
import type { Conversation } from "@/lib/dashboard-service";
import { toast } from "@/lib/toast";
import { describeApiError, isAuthError } from "@/lib/api";
import { redirectToLogin } from "@/lib/auth";
import { ErrorState } from "@/components/ui/error-state";

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

type ConversationReply = { id: string; author: "agent" | "customer"; body: string; at: string };

export function ApprovalsSection() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [replyTarget, setReplyTarget] = useState<Conversation | null>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [threads, setThreads] = useState<Record<number, ConversationReply[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getConversations(statusFilter === "all" ? undefined : statusFilter, page);
      setConversations(res.data ?? []);
      setLastPage(res.last_page ?? 1);
    } catch (err) {
      if (isAuthError(err)) {
        redirectToLogin();
        return;
      }
      setError(describeApiError(err));
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  const patchConvo = useCallback((id: number, patch: Partial<Conversation>) => {
    setConversations((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...patch, updatedAt: new Date().toISOString() } : entry)),
    );
  }, []);

  const handleEscalate = useCallback(
    (convo: Conversation) => {
      if (convo.status === "ESCALATED") {
        toast.info("Already escalated", `Conversation #${convo.id} is already in the escalation queue.`);
        return;
      }
      patchConvo(convo.id, { status: "ESCALATED", assignedTo: "Manager" });
      toast.warning("Escalated to manager", `Conversation with ${convo.customerName} flagged for human takeover.`);
    },
    [patchConvo],
  );

  const handleResolve = useCallback(
    (convo: Conversation) => {
      if (convo.status === "RESOLVED") {
        toast.info("Already resolved", `Conversation #${convo.id} was previously closed.`);
        return;
      }
      patchConvo(convo.id, { status: "RESOLVED" });
      toast.success("Conversation resolved", `${convo.customerName} marked as resolved.`);
    },
    [patchConvo],
  );

  const openReply = useCallback((convo: Conversation) => {
    setReplyTarget(convo);
    setReplyDraft("");
  }, []);

  const closeReply = useCallback(() => {
    setReplyTarget(null);
    setReplyDraft("");
    setReplySending(false);
  }, []);

  const sendReply = useCallback(async () => {
    if (!replyTarget) return;
    const body = replyDraft.trim();
    if (!body) {
      toast.error("Empty reply", "Type a message before sending.");
      return;
    }
    setReplySending(true);
    await new Promise((resolve) => setTimeout(resolve, 380));
    setThreads((prev) => ({
      ...prev,
      [replyTarget.id]: [
        ...(prev[replyTarget.id] ?? []),
        { id: `r-${Date.now()}`, author: "agent", body, at: new Date().toISOString() },
      ],
    }));
    if (replyTarget.status === "ESCALATED" || replyTarget.status === "WAITING") {
      patchConvo(replyTarget.id, { status: "OPEN" });
    } else {
      patchConvo(replyTarget.id, {});
    }
    toast.success("Reply sent", `Message delivered to ${replyTarget.customerName} via ${replyTarget.channel.toLowerCase()}.`);
    closeReply();
  }, [replyTarget, replyDraft, patchConvo, closeReply]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!replyTarget) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeReply();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [replyTarget, closeReply]);

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
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Inbox className="h-4 w-4" />
            Ferreira&apos;s Inbox
          </div>
          <h2 className="mt-1 text-xl font-semibold text-foreground">Conversations</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            WhatsApp, SMS, email and phone enquiries across all channels.
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
          { label: "Open", count: openCount, color: "text-chart-1", caption: "Awaiting reply" },
          { label: "Waiting", count: waitingCount, color: "text-warning", caption: "Customer reply pending" },
          { label: "Escalated", count: escalatedCount, color: "text-destructive", caption: "Needs human takeover" },
          { label: "Total", count: conversations.length, color: "text-foreground", caption: "In current view" },
        ].map((s, i) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: "both" }}
          >
            <span className={cn("text-2xl font-semibold", s.color)}>{s.count}</span>
            <p className="text-sm font-medium text-foreground mt-1">{s.label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{s.caption}</p>
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

      {error ? (
        <ErrorState message={error} onRetry={load} variant="inline" />
      ) : null}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : conversations.length === 0 && !error ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-2 opacity-60" />
          <p className="text-sm text-muted-foreground">No conversations to display.</p>
        </div>
      ) : conversations.length === 0 ? null : (
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
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : convo.id)}
                  aria-expanded={isExpanded}
                  className="flex w-full items-start justify-between gap-3 p-4 text-left transition-colors hover:bg-secondary/30 sm:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", sc.bg)}>
                      <ChannelIcon className={cn("w-5 h-5", sc.color)} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="truncate text-sm font-semibold text-foreground">
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
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {convo.channel} · {convo.vehicle} · Assigned to {convo.assignedTo}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground sm:hidden">{fmtDate(convo.updatedAt)}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                    <span className="hidden text-xs text-muted-foreground sm:inline">{fmtDate(convo.updatedAt)}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

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

                    {threads[convo.id] && threads[convo.id].length > 0 ? (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Sent replies</p>
                        <div className="space-y-2">
                          {threads[convo.id].map((reply) => (
                            <div
                              key={reply.id}
                              className="rounded-lg border border-success/20 bg-success/5 p-3 text-sm text-foreground"
                            >
                              <p className="text-xs font-semibold uppercase tracking-wide text-success">
                                You · {fmtDate(reply.at)}
                              </p>
                              <p className="mt-1 leading-6">{reply.body}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openReply(convo)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" /> Reply
                      </button>
                      <button
                        onClick={() => handleEscalate(convo)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warning/10 text-warning text-sm font-medium hover:bg-warning/20 transition-colors"
                      >
                        <Clock className="w-4 h-4" /> Escalate
                      </button>
                      <button
                        onClick={() => handleResolve(convo)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-muted-foreground text-sm font-medium hover:text-foreground transition-colors"
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

      <AnimatePresence>
        {replyTarget ? (
          <motion.div
            key="reply-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm"
            onClick={closeReply}
          >
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby="reply-drawer-title"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              onClick={(event) => event.stopPropagation()}
              className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-card shadow-2xl"
            >
              <header className="flex items-start justify-between gap-3 border-b border-border p-5">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Reply via {replyTarget.channel.toLowerCase()}
                  </p>
                  <h3 id="reply-drawer-title" className="mt-1 truncate text-lg font-semibold text-foreground">
                    {replyTarget.customerName}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {replyTarget.vehicle ?? "No vehicle on file"} · #{replyTarget.id}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeReply}
                  className="rounded-md p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                  aria-label="Close reply drawer"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Customer
                  </p>
                  <div className="rounded-lg bg-secondary p-3 text-sm leading-6 text-foreground">
                    {replyTarget.message}
                  </div>
                </div>

                {(threads[replyTarget.id] ?? []).map((reply) => (
                  <div
                    key={reply.id}
                    className="rounded-lg border border-success/20 bg-success/5 p-3 text-sm leading-6 text-foreground"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-success">
                      You · {fmtDate(reply.at)}
                    </p>
                    <p className="mt-1">{reply.body}</p>
                  </div>
                ))}
              </div>

              <footer className="space-y-3 border-t border-border bg-background p-5">
                <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Compose reply
                </label>
                <textarea
                  value={replyDraft}
                  onChange={(event) => setReplyDraft(event.target.value)}
                  rows={4}
                  placeholder={`Reply to ${replyTarget.customerName} on ${replyTarget.channel.toLowerCase()}…`}
                  className="w-full rounded-lg border border-border bg-card p-3 text-sm text-foreground outline-none focus:border-accent"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeReply}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={sendReply}
                    disabled={replySending}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent/90 disabled:opacity-60"
                  >
                    {replySending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {replySending ? "Sending…" : "Send reply"}
                  </button>
                </div>
              </footer>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
