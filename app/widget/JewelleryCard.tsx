/**
 * @file JewelleryCard.tsx
 * An individual jewellery product card for the carousel.
 *
 * Renders:
 *   • Product image (via ProductImage)
 *   • Match percentage score arc
 *   • Product name + price
 *   • AI recommendation reasons
 *   • Style / occasion tag chips (via ProductBadge)
 *   • Premium Select CTA (via SelectButton)
 *
 * Apps SDK NOTE: The card is intentionally self-contained so it can be
 * rendered in isolation inside the ChatGPT iframe sandbox. No side effects
 * or global state are introduced here.
 */

"use client";

import React, { memo, useCallback, useState } from "react";
import { SelectButton } from "./Button";
import { ProductBadge } from "./ProductBadge";
import { ProductImage } from "./ProductImage";
import type { Product } from "./types";

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Circular score indicator rendered as a mini SVG arc */
function ScoreArc({ score }: { score: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Colour shifts from amber → gold → rich gold based on score
  const strokeColor =
    score >= 90
      ? "#c9a84c"
      : score >= 75
        ? "#d4a843"
        : score >= 60
          ? "#c8903a"
          : "#9e7a30";

  return (
    <div
      className="relative flex h-12 w-12 shrink-0 items-center justify-center"
      role="img"
      aria-label={`${score}% match`}
    >
      <svg
        className="-rotate-90"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        {/* Track ring */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke="#f0e8d5"
          strokeWidth="3.5"
        />
        {/* Progress arc */}
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-amber-800">
        {score}%
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface JewelleryCardProps {
  product: Product;
  /** 1-based card index displayed as an ordinal badge */
  index: number;
  /** Whether this card is the top AI recommendation */
  isRecommended: boolean;
  /** Fires when the user confirms their selection */
  onSelect: (productId: string) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `JewelleryCard` renders a single product in the carousel.
 * Memoised so that only changed cards re-render during list updates.
 */
export const JewelleryCard = memo<JewelleryCardProps>(function JewelleryCard({
  product,
  index,
  isRecommended,
  onSelect,
}) {
  const [selecting, setSelecting] = useState(false);

  /** Simulate brief async confirmation before delegating to parent */
  const handleSelect = useCallback(async () => {
    setSelecting(true);
    // Give the user a brief visual confirmation tick (100ms)
    await new Promise<void>((r) => setTimeout(r, 120));
    onSelect(product.id);
    setSelecting(false);
  }, [onSelect, product.id]);

  // Limit tag display to avoid overflow
  const styleTags = product.aiTags.styleTags.slice(0, 3);
  const occasionTags = product.aiTags.occasionTags.slice(0, 2);
  const reasons = product.reasons.slice(0, 3);

  return (
    <article
      className={[
        // Card shell
        "relative flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl",
        "bg-white shadow-sm",
        // Recommended card gets a golden top border accent
        isRecommended
          ? "border border-amber-300/60 shadow-amber-100/80 shadow-lg ring-1 ring-amber-200/40"
          : "border border-neutral-100 shadow-neutral-100",
        // Smooth scale on focus-within for keyboard navigation
        "transition-shadow duration-200 hover:shadow-md focus-within:shadow-md",
      ].join(" ")}
      aria-label={`${product.name}, ${isRecommended ? "top recommendation, " : ""}${product.score}% match`}
    >
      {/* ── Ordinal badge ── */}
      <div
        className={[
          "absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center",
          "rounded-full border text-xs font-bold shadow-sm",
          isRecommended
            ? "border-amber-300 bg-amber-50 text-amber-800"
            : "border-neutral-200 bg-white text-neutral-500",
        ].join(" ")}
        aria-hidden="true"
      >
        {index}
      </div>

      {/* ── Recommended ribbon ── */}
      {isRecommended && (
        <div
          className="absolute right-0 top-3 z-10 flex items-center gap-1 rounded-l-full bg-gradient-to-r from-amber-500 to-amber-400 px-3 py-1 shadow-sm"
          aria-hidden="true"
        >
          <svg
            className="h-3 w-3 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white">
            Top Pick
          </span>
        </div>
      )}

      {/* ── Product image ── */}
      <ProductImage
        src={product.image}
        alt={product.name}
        isRecommended={isRecommended}
      />

      {/* ── Card body ── */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Score + Name row */}
        <div className="flex items-start gap-3">
          <ScoreArc score={product.score} />
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-neutral-900">
              {product.name}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-amber-700">
              {product.aiTags.category}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-extrabold text-neutral-900">
            ₹{product.price.toLocaleString("en-IN")}
          </span>
          <span className="text-xs text-neutral-400">INR</span>
        </div>

        {/* Divider */}
        <hr className="border-neutral-100" />

        {/* AI recommendation reasons */}
        {reasons.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-amber-700/70">
              Why it works
            </p>
            <ul className="space-y-1.5" role="list">
              {reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-neutral-600">
                  <span
                    className="mt-0.5 shrink-0 text-amber-500"
                    aria-hidden="true"
                  >
                    ✦
                  </span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Style tags */}
        {styleTags.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              Style
            </p>
            <div className="flex flex-wrap gap-1.5" role="list" aria-label="Style tags">
              {styleTags.map((tag) => (
                <ProductBadge key={tag} label={tag} color="secondary" />
              ))}
            </div>
          </div>
        )}

        {/* Occasion tags */}
        {occasionTags.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">
              Occasion
            </p>
            <div className="flex flex-wrap gap-1.5" role="list" aria-label="Occasion tags">
              {occasionTags.map((tag) => (
                <ProductBadge key={tag} label={tag} color="info" />
              ))}
            </div>
          </div>
        )}

        {/* Spacer pushes button to bottom */}
        <div className="flex-1" />

        {/* CTA */}
        <SelectButton
          onClick={handleSelect}
          isPrimary={isRecommended}
          loading={selecting}
          aria-label={`Select ${product.name}`}
        />
      </div>
    </article>
  );
});

JewelleryCard.displayName = "JewelleryCard";
