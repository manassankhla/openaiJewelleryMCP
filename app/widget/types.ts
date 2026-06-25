/**
 * @file types.ts
 * Shared TypeScript type definitions for the Jewellery Carousel widget.
 * These types mirror the structured content delivered by the OpenAI Apps SDK
 * from the MCP tool call result (ui/notifications/tool-result).
 */

// ---------------------------------------------------------------------------
// Domain model
// ---------------------------------------------------------------------------

export interface AiTags {
  /** e.g. "necklace", "earrings", "bangles" */
  category: string;
  /** e.g. ["classic", "vintage", "statement"] */
  styleTags: string[];
  /** e.g. ["wedding", "reception", "party"] */
  occasionTags: string[];
  /** e.g. ["burgundy", "ivory", "navy"] */
  bestOutfitColours: string[];
  /** e.g. ["lehenga", "saree", "gown"] */
  bestOutfitTypes: string[];
}

export interface Product {
  /** Unique identifier for the product */
  id: string;
  /** Display name of the jewellery piece */
  name: string;
  /** Full URL to the product image (Cloudinary, CDN, etc.) */
  image: string;
  /** Price in INR (Indian Rupees) */
  price: number;
  /** AI match score: 0–100 */
  score: number;
  /** Human-readable reasons for the recommendation */
  reasons: string[];
  /** AI-generated tags for filtering & display */
  aiTags: AiTags;
}

// ---------------------------------------------------------------------------
// Widget props
// ---------------------------------------------------------------------------

export interface WidgetProps {
  /** List of recommended products from ChatGPT. Never hardcoded. */
  products: Product[];
  /**
   * Callback fired when the user clicks "Premium Select" on a product.
   * Posts a message back to the parent ChatGPT frame so it can continue
   * the conversation with the selected product ID.
   *
   * Apps SDK NOTE: In a real Apps SDK deployment this would be wired to
   * the SDK's `sendMessage` or `completeAction` bridge method.
   */
  onSelect: (productId: string) => void;
}

// ---------------------------------------------------------------------------
// State helpers
// ---------------------------------------------------------------------------

export type LoadState = "loading" | "empty" | "error" | "ready";
