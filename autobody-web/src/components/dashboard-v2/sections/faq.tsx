"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, HelpCircle, BookOpen } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    category: "Getting Started",
    question: "How do I create a new order?",
    answer:
      "Open the Orders section and click 'New Order'. Select the customer (or walk-in), add parts, set the branch, and confirm. The order will appear in the list immediately.",
  },
  {
    category: "Getting Started",
    question: "What order statuses are available?",
    answer:
      "Pending → Confirmed → Fulfilled. Orders can also be Cancelled or Refunded if needed. Each status change is tracked in the Audit Trail.",
  },
  {
    category: "Conversations",
    question: "How do WhatsApp enquiries work?",
    answer:
      "Customer messages arrive in the Conversations tab. Each thread shows the channel (WhatsApp, SMS, Email, Phone), vehicle, and assigned staff member. You can reply, escalate, or mark as resolved.",
  },
  {
    category: "Conversations",
    question: "What happens when a conversation is escalated?",
    answer:
      "The conversation status changes to Escalated and appears in the badge count. A senior staff member can then take over and resolve the issue.",
  },
  {
    category: "Inventory",
    question: "How do I know when stock is low?",
    answer:
      "The Overview dashboard shows a Low Stock Items count. Notifications also fire automatically when popular parts drop below threshold at any branch.",
  },
  {
    category: "Orders",
    question: "Can I filter orders by source?",
    answer:
      "Yes. The Orders table supports filtering by status and searching by order ID, customer name, or part description. Sources include Walk-in, WhatsApp, Shopify, and Web.",
  },
  {
    category: "Orders",
    question: "How do I track order fulfilment?",
    answer:
      "The Orders list shows live status. The Reports tab shows fulfilment rate and revenue trends across all branches and channels.",
  },
  {
    category: "Reports",
    question: "What reports are available?",
    answer:
      "Revenue by branch, orders by source, status breakdown, orders over time, total revenue, average order value, and fulfilment rate — all driven by live data.",
  },
  {
    category: "General",
    question: "Which currencies are supported?",
    answer:
      "Demo runs on ZAR. Production deployments support ZAR, USD, ZMW, and SZL based on the branch.",
  },
  {
    category: "General",
    question: "How do notifications work?",
    answer:
      "In-app notifications fire on new orders, stock alerts, escalated conversations, fulfilment updates, and promo reminders. Open the Notifications tab to manage them.",
  },
];

const CATEGORIES = Array.from(new Set(FAQ_ITEMS.map((f) => f.category)));

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all" ? FAQ_ITEMS : FAQ_ITEMS.filter((f) => f.category === activeCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Help &amp; Guidance</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Frequently asked questions about the autobody workspace
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
            activeCategory === "all"
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground",
          )}
        >
          All
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              activeCategory === cat
                ? "bg-accent text-accent-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground",
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="bg-card border border-border rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2"
              style={{ animationDelay: `${index * 40}ms`, animationFillMode: "both" }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-4 h-4 text-accent shrink-0" />
                  <span className="text-sm font-medium text-foreground">{item.question}</span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200",
                    isOpen && "rotate-180",
                  )}
                />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pl-11">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-secondary text-[10px] font-medium text-muted-foreground">
                    {item.category}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
