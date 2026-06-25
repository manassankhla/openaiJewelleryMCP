/**
 * @file index.ts
 * Public entry point for the Jewellery Carousel widget.
 *
 * ╔══════════════════════════════════════════════════════════════╗
 * ║              OpenAI Apps SDK Integration Guide               ║
 * ╠══════════════════════════════════════════════════════════════╣
 * ║                                                              ║
 * ║  DATA CONTRACT                                               ║
 * ║  The widget expects `products` as structured content from    ║
 * ║  a ChatGPT MCP tool result. The Apps SDK delivers this via  ║
 * ║  the `ui/notifications/tool-result` JSON-RPC notification.  ║
 * ║                                                              ║
 * ║  MOUNTING (Vite / standalone)                                ║
 * ║  ─────────────────────────────────────────────────────────   ║
 * ║  import "@openai/apps-sdk-ui/css"   // must come first      ║
 * ║  import { mountJewelleryCarousel }  from "@/widget"         ║
 * ║  mountJewelleryCarousel(document.getElementById("root")!)   ║
 * ║                                                              ║
 * ║  MOUNTING (Next.js App Router)                               ║
 * ║  ─────────────────────────────────────────────────────────   ║
 * ║  Already handled by app/widget/cards/page.tsx.              ║
 * ║  Import JewelleryCarousel directly and wrap with            ║
 * ║  <AppsSDKUIProvider> if router link components are needed.  ║
 * ║                                                              ║
 * ║  onSelect BRIDGE                                             ║
 * ║  ─────────────────────────────────────────────────────────   ║
 * ║  The default `onSelect` in `mountJewelleryCarousel` posts   ║
 * ║  { type: "mcp_widget_action", action: "select_product",     ║
 * ║    productId } to window.parent so the Apps SDK host can    ║
 * ║  route it back into the conversation turn.                  ║
 * ║                                                              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

// Re-export everything needed by consuming code ───────────────────────────

export { JewelleryCarousel } from "./JewelleryCarousel";
export { EmptyState, ErrorState, LoadingState } from "./JewelleryCarousel";
export { JewelleryCard } from "./JewelleryCard";
export { ProductImage } from "./ProductImage";
export { ProductBadge } from "./ProductBadge";
export { SelectButton } from "./Button";

// Type re-exports
export type { AiTags, LoadState, Product, WidgetProps } from "./types";

// ---------------------------------------------------------------------------
// Standalone mount helper (for Vite / non-Next.js projects)
// ---------------------------------------------------------------------------

import type { Product } from "./types";

/**
 * Apps SDK postMessage select handler — default implementation.
 * Posts the selected product ID back to the ChatGPT host so it can
 * continue the conversation turn.
 *
 * Apps SDK NOTE: In a future SDK release this would be replaced with
 * the SDK's `sendMessage` or `completeAction` bridge API.
 */
function defaultOnSelect(productId: string): void {
  window.parent.postMessage(
    {
      // Apps SDK widget action protocol
      type: "mcp_widget_action",
      action: "select_product",
      productId,
    },
    "*",
  );
}

/**
 * Mounts the Jewellery Carousel widget into a DOM element.
 *
 * Call this from your `main.tsx` after importing the Apps SDK CSS.
 *
 * @example
 * ```ts
 * import "@openai/apps-sdk-ui/css";
 * import { mountJewelleryCarousel } from "@/widget";
 *
 * mountJewelleryCarousel(document.getElementById("root")!, {
 *   onSelect: (id) => console.log("selected:", id),
 * });
 * ```
 */
export async function mountJewelleryCarousel(
  container: HTMLElement,
  options?: {
    /** Override the default `window.parent.postMessage` select handler */
    onSelect?: (productId: string) => void;
  },
): Promise<void> {
  const [React, ReactDOM, { JewelleryCarousel, LoadingState, ErrorState }] =
    await Promise.all([
      import("react"),
      import("react-dom/client"),
      import("./JewelleryCarousel"),
    ]);

  const { createElement, StrictMode, useState, useEffect, useRef } = React;
  const { createRoot } = ReactDOM;
  const onSelect = options?.onSelect ?? defaultOnSelect;

  /**
   * Inner host component — listens for Apps SDK postMessage data and
   * manages loading / error / ready states.
   *
   * Apps SDK NOTE: This component runs inside the ChatGPT iframe sandbox.
   * It uses `window.addEventListener("message", ...)` to receive the
   * `ui/notifications/tool-result` JSON-RPC notification from the host.
   */
  function WidgetHost() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        const msg = event.data as Record<string, unknown> | null;
        if (!msg) return;

        let structuredContent: unknown = null;

        // Shape 1: JSON-RPC 2.0 tool-result notification (Apps SDK primary)
        if (
          msg["jsonrpc"] === "2.0" &&
          msg["method"] === "ui/notifications/tool-result" &&
          msg["params"]
        ) {
          structuredContent =
            (msg["params"] as Record<string, unknown>)["structuredContent"];
        }
        // Shape 2: openai_globals envelope
        else if (msg["type"] === "openai_globals" && msg["toolOutput"]) {
          structuredContent =
            (msg["toolOutput"] as Record<string, unknown>)["structuredContent"];
        }
        // Shape 3: direct structuredContent (dev / test harness)
        else if (msg["structuredContent"]) {
          structuredContent = msg["structuredContent"];
        }

        if (
          structuredContent !== null &&
          typeof structuredContent === "object" &&
          Array.isArray(
            (structuredContent as Record<string, unknown>)["products"],
          )
        ) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          setProducts(
            (structuredContent as { products: Product[] }).products,
          );
          setLoading(false);
          setError(null);
        }
      };

      window.addEventListener("message", handleMessage);

      // Apps SDK iframe readiness handshake
      window.parent.postMessage({ type: "iframe_ready" }, "*");

      // Fallback timeout if no data arrives
      timeoutRef.current = setTimeout(() => {
        setLoading(false);
        setError(
          "No recommendation data received. Ensure the MCP tool is configured and Developer Mode is enabled in ChatGPT.",
        );
      }, 5000);

      return () => {
        window.removeEventListener("message", handleMessage);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, []);

    if (loading) return createElement(LoadingState);
    if (error && products.length === 0)
      return createElement(ErrorState, { message: error });

    return createElement(JewelleryCarousel, { products, onSelect });
  }

  createRoot(container).render(
    createElement(StrictMode, null, createElement(WidgetHost)),
  );
}
