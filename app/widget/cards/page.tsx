/**
 * @file app/widget/cards/page.tsx
 * Next.js App Router page that hosts the Jewellery Carousel widget.
 *
 * This page is served inside the ChatGPT iframe when the Apps SDK renders
 * the widget. It is intentionally a thin "shell" — all UI logic lives in
 * the sibling widget components.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │                  Apps SDK Integration Notes                  │
 * ├─────────────────────────────────────────────────────────────┤
 * │                                                              │
 * │  DATA FLOW                                                   │
 * │  ChatGPT MCP tool result → `ui/notifications/tool-result`  │
 * │  JSON-RPC notification → postMessage to this iframe →       │
 * │  `useWidgetData` hook → `products` prop → JewelleryCarousel │
 * │                                                              │
 * │  onSelect BRIDGE                                             │
 * │  Clicking "Premium Select" fires:                           │
 * │    window.parent.postMessage({                              │
 * │      type: "mcp_widget_action",                             │
 * │      action: "select_product",                              │
 * │      productId,                                             │
 * │    }, "*")                                                   │
 * │  The Apps SDK host picks this up and resumes the            │
 * │  conversation turn with the selected product.               │
 * │                                                              │
 * └─────────────────────────────────────────────────────────────┘
 */

"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { EmptyState, ErrorState, JewelleryCarousel, LoadingState } from "../JewelleryCarousel";
import type { Product } from "../types";

// ---------------------------------------------------------------------------
// Apps SDK data hook
// ---------------------------------------------------------------------------

/**
 * `useWidgetData` subscribes to `window.message` events from the ChatGPT
 * Apps SDK host and extracts the structured product array from all known
 * message envelope shapes.
 *
 * Apps SDK NOTE: The hook also fires the `iframe_ready` postMessage
 * handshake so the host knows the iframe has mounted and can begin
 * sending tool result data.
 */
function useWidgetData() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const msg = event.data;
      if (!msg) return;

      let structuredContent: unknown = null;

      // ── Apps SDK message shape 1: JSON-RPC 2.0 tool-result ──────────────
      if (
        msg.jsonrpc === "2.0" &&
        msg.method === "ui/notifications/tool-result" &&
        msg.params
      ) {
        structuredContent = msg.params.structuredContent;
      }
      // ── Apps SDK message shape 2: openai_globals envelope ───────────────
      else if (msg.type === "openai_globals" && msg.toolOutput) {
        structuredContent = msg.toolOutput.structuredContent;
      }
      // ── Shape 3: direct structuredContent (dev / test harness) ──────────
      else if (msg.structuredContent) {
        structuredContent = msg.structuredContent;
      }

      if (
        structuredContent &&
        typeof structuredContent === "object" &&
        Array.isArray(
          (structuredContent as Record<string, unknown>).products,
        )
      ) {
        // Clear the fallback timeout since we received real data
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setProducts(
          (structuredContent as { products: Product[] }).products,
        );
        setLoading(false);
        setError(null);
      }
    };

    window.addEventListener("message", handleMessage);

    // ── Apps SDK iframe readiness handshake ──────────────────────────────
    // Signal to the ChatGPT host that the iframe is mounted and ready.
    window.parent.postMessage({ type: "iframe_ready" }, "*");

    // Fallback: if no data arrives within 6 seconds, surface an error state
    timeoutRef.current = setTimeout(() => {
      setLoading(false);
      setError(
        "Waiting for recommendation data. Make sure the MCP tool is connected and Developer Mode is enabled in ChatGPT.",
      );
    }, 6000);

    return () => {
      window.removeEventListener("message", handleMessage);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { products, loading, error };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

/**
 * `JewelleryCardsPage` is the Next.js route component for `/widget/cards`.
 * It wires the Apps SDK data hook to the JewelleryCarousel widget.
 */
export default function JewelleryCardsPage() {
  const { products, loading, error } = useWidgetData();

  /**
   * Apps SDK onSelect bridge:
   * Posts the selected product ID back to the ChatGPT host so it can
   * continue the conversation turn (e.g. ask "Would you like to try it on?").
   */
  const handleSelect = useCallback((productId: string) => {
    // Apps SDK widget action protocol
    window.parent.postMessage(
      {
        type: "mcp_widget_action",
        action: "select_product",
        productId,
      },
      "*",
    );
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="min-h-screen w-full bg-white p-4">
        <LoadingState />
      </main>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error && products.length === 0) {
    return (
      <main className="min-h-screen w-full bg-white p-4">
        <ErrorState message={error} />
      </main>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (products.length === 0) {
    return (
      <main className="min-h-screen w-full bg-white p-4">
        <EmptyState />
      </main>
    );
  }

  // ── Ready ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen w-full bg-white p-3 sm:p-4">
      <JewelleryCarousel products={products} onSelect={handleSelect} />
    </main>
  );
}
