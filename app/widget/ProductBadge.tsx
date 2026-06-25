/**
 * @file ProductBadge.tsx
 * A small, reusable pill-shaped badge for displaying tags (style, occasion, etc.).
 *
 * Apps SDK NOTE: Uses the `Badge` component from `@openai/apps-sdk-ui` to ensure
 * visual consistency with the host ChatGPT design system (colours, border-radius,
 * typography tokens all come from the SDK's design system layer).
 */

"use client";

import { Badge } from "@openai/apps-sdk-ui/components/Badge";
import React, { memo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductBadgeProps {
  /** Text label to display inside the badge */
  label: string;
  /**
   * Semantic colour variant for the badge.
   * Maps to the Apps SDK UI `SemanticColors` type.
   * @default "secondary"
   */
  color?: "secondary" | "success" | "danger" | "warning" | "info" | "discovery";
  /** Optional additional Tailwind classes */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `ProductBadge` wraps the Apps SDK `<Badge>` with a soft pill variant,
 * providing a consistent tag chip used across style/occasion/colour tags.
 */
export const ProductBadge = memo<ProductBadgeProps>(function ProductBadge({
  label,
  color = "secondary",
  className,
}) {
  return (
    // Apps SDK Badge — inherits ChatGPT design tokens automatically
    <Badge
      variant="soft"
      pill
      size="sm"
      color={color}
      className={className}
    >
      {label}
    </Badge>
  );
});

ProductBadge.displayName = "ProductBadge";
