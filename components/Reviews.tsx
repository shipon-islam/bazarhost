"use client";

import { useRef } from "react";
import { reviews } from "@/data/reviews";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const avatarShades = [
  "bg-navy text-white",
  "bg-orange text-white",
  "bg-ink text-white",
  "bg-orange-light text-ink",
];

export default function Reviews() {
  const trackRef = useRef<HTMLDivElement>(null);

  function scroll(direction: "left" | "right") {
    const el = trackRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.85);
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  }

  return (
    <section className="bg-navy-dark/[0.03] py-16">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange">
              Verified buyers
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold text-ink">
              What customers are saying
            </h2>
          </div>
          <div className="hidden shrink-0 gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label="Scroll to previous reviews"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-orange hover:text-orange"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label="Scroll to next reviews"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 bg-white text-ink transition-colors hover:border-orange hover:text-orange"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="scrollbar-hide -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2"
        >
          {reviews.map((review, i) => (
            <article
              key={review.id}
              className="flex w-[280px] shrink-0 snap-start flex-col rounded-card border border-ink/10 bg-white p-6 sm:w-[320px]"
            >
              <div className="flex text-orange" aria-hidden>
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <svg
                    key={starIndex}
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    className={
                      starIndex < review.rating ? "fill-orange" : "fill-ink/10"
                    }
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>

              <p className="mt-4 flex-1 text-sm leading-relaxed text-slate">
                &ldquo;{review.quote}&rdquo;
              </p>

              <div className="mt-5 flex items-center gap-3 border-t border-ink/10 pt-4">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarShades[i % avatarShades.length]}`}
                >
                  {initials(review.name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {review.name}
                  </p>
                  <p className="truncate text-xs text-slate-muted">
                    {review.location} · {review.product}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
