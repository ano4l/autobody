"use client";

import { ExternalLink, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const reviews = [
  {
    name: "Fortune Mdluli",
    rating: 5,
    text: "Got what I needed for my car and the service was quick.",
    date: "Public Google review mirror",
  },
  {
    name: "Brian Maluleka",
    rating: 4,
    text: "Helpful team for used and new autobody spares. Good place to check for panels and lights.",
    date: "Public Google review mirror",
  },
  {
    name: "Marius Grobler",
    rating: 1,
    text: "Could not get the part I was looking for. Follow-up needed.",
    date: "Public Google review mirror",
  },
  {
    name: "Local Guide",
    rating: 3,
    text: "Useful spares shop in East Lynne. Stock availability depends on the part.",
    date: "Public Google review mirror",
  },
];

export function ReviewsSection() {
  const average = 3.4;
  const count = 18;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Google Reviews</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Public review snapshot for Ferreira&apos;s Used and New Autobody Spares.
          </p>
        </div>
        <a
          href="https://www.google.com/search?q=Ferreira%27s+Used+and+New+Autobody+Spares+reviews"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:text-foreground"
        >
          Open Google search
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">Public rating</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-5xl font-bold">{average.toFixed(1)}</span>
            <span className="pb-2 text-sm text-muted-foreground">/ 5.0</span>
          </div>
          <div className="mt-4 flex gap-1 text-warning">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className="h-5 w-5 fill-current" />
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">{count} public comments mirrored online</p>
          <div className="mt-5 rounded-lg bg-secondary/70 p-3 text-sm">
            201 Stormvoel Rd, East Lynne, Pretoria
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <article key={`${review.name}-${review.rating}`} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{review.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{review.date}</p>
                </div>
                <Badge tone={review.rating >= 4 ? "leaf" : review.rating <= 2 ? "rust" : "amber"}>
                  {review.rating}.0
                </Badge>
              </div>
              <div className="mt-4 flex gap-1 text-warning">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-current" : "opacity-25"}`} />
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{review.text}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
