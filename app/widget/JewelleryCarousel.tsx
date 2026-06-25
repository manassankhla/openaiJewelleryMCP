/**
 * @file JewelleryCarousel.tsx
 * Root widget component — the entry point rendered inside ChatGPT.
 *
 * ┌──────────────────────────────────────────────────────────┐
 * │                      Apps SDK Notes                      │
 * ├──────────────────────────────────────────────────────────┤
 * │ 1. DATA FLOW                                             │
 * │    ChatGPT → MCP tool result → `ui/notifications/        │
 * │    tool-result` message → postMessage to iframe →        │
 * │    `useWidgetData` hook → `products` prop here.          │
 * │                                                          │
 * │ 2. onSelect BRIDGE                                       │
 * │    When the user clicks "Premium Select" we call         │
 * │    `window.parent.postMessage` with type                 │
 * │    `mcp_widget_action` so the Apps SDK host can pick     │
 * │    it up and continue the conversation turn.             │
 * │                                                          │
 * │ 3. ISOLATION                                             │
 * │    This component runs inside an <iframe> — no routing,  │
 * │    no server calls, no global stores. All state is local. │
 * └──────────────────────────────────────────────────────────┘
 */

"use client";

import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { JewelleryCard } from "./JewelleryCard";
import type { Product, WidgetProps } from "./types";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Width of a single card in pixels (must match card's w-72 = 288px) */
const CARD_WIDTH = 288;
/** Gap between cards in pixels (gap-4 = 16px) */
const CARD_GAP = 16;

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

function LoadingState() {
  return (
    <div
      className="flex min-h-[380px] flex-col items-center justify-center gap-4 p-8"
      role="status"
      aria-live="polite"
      aria-label="Loading jewellery recommendations"
    >
      {/* Animated diamond spinner */}
      <div className="relative flex h-12 w-12 items-center justify-center">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-amber-400 border-r-amber-300" />
        <svg
          className="h-6 w-6 text-amber-300"
          viewBox="0 0 64 64"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M32 4L52 20L32 60L12 20L32 4Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-neutral-700">
          Curating your jewellery
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          Matching pieces to your outfit & occasion…
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState() {
  return (
    <div
      className="flex min-h-[380px] flex-col items-center justify-center gap-4 p-8 text-center"
      role="status"
      aria-live="polite"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
        <svg
          className="h-8 w-8 text-amber-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-700">
          No recommendations found
        </p>
        <p className="mt-1 text-xs text-neutral-400">
          Try describing your outfit or occasion to ChatGPT.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function ErrorState({ message }: { message: string }) {
  return (
    <div
      className="flex min-h-[380px] flex-col items-center justify-center gap-4 p-8 text-center"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <svg
          className="h-8 w-8 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-neutral-700">
          Something went wrong
        </p>
        <p className="mt-1 text-xs text-neutral-400">{message}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Carousel nav arrow
// ---------------------------------------------------------------------------

interface NavArrowProps {
  direction: "left" | "right";
  onClick: () => void;
  disabled: boolean;
  "aria-label": string;
}

const NavArrow = memo<NavArrowProps>(function NavArrow({
  direction,
  onClick,
  disabled,
  "aria-label": ariaLabel,
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={[
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border",
        "bg-white shadow-sm transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2",
        disabled
          ? "cursor-not-allowed border-neutral-100 text-neutral-200"
          : "border-amber-200 text-amber-700 hover:bg-amber-50 hover:shadow-md active:scale-95",
      ].join(" ")}
    >
      {direction === "left" ? (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
});

NavArrow.displayName = "NavArrow";

// ---------------------------------------------------------------------------
// Main carousel component
// ---------------------------------------------------------------------------

/**
 * `JewelleryCarousel` — the top-level widget rendered inside ChatGPT.
 *
 * Accepts a `products` array from the Apps SDK tool result (never hardcoded)
 * and renders a smooth, keyboard-accessible horizontal carousel.
 *
 * The `onSelect` callback is supplied by the parent page/host integration
 * (see `index.ts`) and posts the selected product ID back to ChatGPT.
 */
export const JewelleryCarousel = memo<WidgetProps>(function JewelleryCarousel({
  products,
  onSelect,
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Find the index of the highest-scoring product → "recommended"
  const recommendedIndex = useMemo(() => {
    if (products.length === 0) return -1;
    return products.reduce(
      (bestIdx, p, idx) =>
        p.score > products[bestIdx].score ? idx : bestIdx,
      0,
    );
  }, [products]);

  /** Update nav arrow visibility based on scroll position */
  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    // Also observe resize (responsive containers)
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [updateScrollState, products]);

  const scrollBy = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const delta = (CARD_WIDTH + CARD_GAP) * (direction === "right" ? 1 : -1);
    el.scrollBy({ left: delta, behavior: "smooth" });
  }, []);

  /** Handle product selection — notifies parent and sets local visual state */
  const handleSelect = useCallback(
    (productId: string) => {
      setSelectedId(productId);
      onSelect(productId);
    },
    [onSelect],
  );

  // ── Render states ──────────────────────────────────────────────────────────

  if (products.length === 0) {
    return (
      <section className="w-full rounded-2xl bg-white">
        <EmptyState />
      </section>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <section
      className="w-full overflow-hidden rounded-2xl bg-white"
      aria-label="Jewellery recommendations carousel"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-4">
        <div className="flex items-center gap-3">
          {/* Gold diamond logo mark */}
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm">
            <svg
              className="h-4 w-4 text-white"
              viewBox="0 0 64 64"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M32 4L52 20L32 60L12 20L32 4Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path
                d="M12 20H52"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              Jewellery Picks
            </h2>
            <p className="text-[11px] text-neutral-400">
              {products.length} curated recommendation
              {products.length !== 1 ? "s" : ""} · sorted by match
            </p>
          </div>
        </div>

        {/* Scroll navigation arrows */}
        {products.length > 1 && (
          <div className="flex items-center gap-1.5" role="group" aria-label="Carousel navigation">
            <NavArrow
              direction="left"
              onClick={() => scrollBy("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll to previous jewellery"
            />
            <NavArrow
              direction="right"
              onClick={() => scrollBy("right")}
              disabled={!canScrollRight}
              aria-label="Scroll to next jewellery"
            />
          </div>
        )}
      </div>

      {/* ── Scrollable card track ── */}
      <div
        ref={scrollRef}
        className={[
          // Horizontal scroll track
          "flex gap-4 overflow-x-auto px-5 py-5",
          // Hide scrollbar visually but keep it functional
          "scrollbar-hide",
          // Smooth momentum scrolling on iOS
          "[scroll-behavior:smooth] [-webkit-overflow-scrolling:touch]",
          // Snap to each card for precise keyboard / touch navigation
          "snap-x snap-mandatory",
        ].join(" ")}
        // Keyboard: allow arrow keys to scroll
        role="list"
        aria-label="Product cards"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            scrollBy("right");
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            scrollBy("left");
          }
        }}
      >
        {products.map((product, idx) => (
          <div
            key={product.id}
            className="snap-start"
            role="listitem"
          >
            <JewelleryCard
              product={product}
              index={idx + 1}
              isRecommended={idx === recommendedIndex}
              onSelect={handleSelect}
            />
          </div>
        ))}
      </div>

      {/* ── Selection confirmation banner ── */}
      {selectedId && (
        <div
          className="flex items-center gap-2 border-t border-amber-100 bg-amber-50 px-5 py-3"
          role="status"
          aria-live="polite"
        >
          <svg
            className="h-4 w-4 shrink-0 text-amber-600"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-xs font-medium text-amber-800">
            You selected:{" "}
            <span className="font-bold">
              {products.find((p) => p.id === selectedId)?.name ?? selectedId}
            </span>
            . ChatGPT will continue the conversation.
          </p>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between border-t border-neutral-100 px-5 py-3">
        <p className="text-[10px] text-neutral-300 tracking-wide">
          Powered by AI · Match scores are personalised
        </p>
        <div className="flex items-center gap-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" aria-hidden="true" />
          <span className="text-[10px] text-amber-600 font-medium">Live</span>
        </div>
      </div>
    </section>
  );
});

JewelleryCarousel.displayName = "JewelleryCarousel";

// ---------------------------------------------------------------------------
// Named re-exports of state components for external use
// ---------------------------------------------------------------------------
export { EmptyState, ErrorState, LoadingState };
