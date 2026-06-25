/**
 * @file Button.tsx
 * A "Premium Select" call-to-action button for the jewellery carousel.
 *
 * Apps SDK NOTE: Wraps `@openai/apps-sdk-ui` Button so that its visual style
 * (height, pill shape, colour tokens, focus ring) automatically aligns with
 * ChatGPT's native design system. We layer a custom gold gradient on top for
 * the luxury jewellery theme.
 */

"use client";

import { Button as SdkButton } from "@openai/apps-sdk-ui/components/Button";
import React, { memo } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SelectButtonProps {
  /** Called when the user confirms their selection */
  onClick: () => void;
  /** When true, renders with gold accent styling (top recommended product) */
  isPrimary?: boolean;
  /** Disables the button and shows a spinner while awaiting confirmation */
  loading?: boolean;
  /** Accessible label for assistive technologies */
  "aria-label"?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `SelectButton` renders the "Premium Select" CTA.
 *
 * - Primary variant: rich gold gradient — used on the recommended product card.
 * - Default variant: subtle cream/warm white — used on all other cards.
 * - Keyboard accessible out of the box (inherits from Apps SDK Button).
 * - Uses Apps SDK Button's built-in `loading` spinner prop for async UX.
 */
export const SelectButton = memo<SelectButtonProps>(function SelectButton({
  onClick,
  isPrimary = false,
  loading = false,
  "aria-label": ariaLabel,
}) {
  return (
    <div className="relative">
      {/*
       * Apps SDK Button — provides accessible focus management, loading state,
       * keyboard handling, and ChatGPT-compatible visual tokens.
       *
       * We use `variant="solid"` with `color="primary"` for the recommended card,
       * and `variant="soft"` with `color="secondary"` for others.
       * Additional luxury gold styling is layered via `className`.
       */}
      <SdkButton
        color={isPrimary ? "primary" : "secondary"}
        variant={isPrimary ? "solid" : "soft"}
        size="sm"
        block
        pill
        loading={loading}
        onClick={onClick}
        aria-label={ariaLabel ?? "Select this jewellery piece"}
        className={[
          "relative overflow-hidden font-semibold tracking-wide transition-all duration-200",
          isPrimary
            ? // Gold gradient for primary CTA — overlaid on top of SDK primary colour
              [
                "!bg-gradient-to-r !from-[#c9a84c] !via-[#e4bc5e] !to-[#c9a84c]",
                "!text-white !shadow-md !shadow-amber-400/30",
                "hover:!shadow-amber-400/50 hover:!brightness-105",
                "active:!scale-[0.98]",
              ].join(" ")
            : // Warm cream for secondary CTA
              [
                "!bg-[#faf6ef] hover:!bg-[#f3edd9] !text-amber-900",
                "!border !border-amber-200/60",
                "active:!scale-[0.98]",
              ].join(" "),
        ].join(" ")}
      >
        {/* Crown icon */}
        <svg
          className="mr-1.5 inline h-3.5 w-3.5 shrink-0"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M10 2l2.5 4 4.5-2-2 5H5L3 4l4.5 2L10 2z" />
          <rect x="4" y="11" width="12" height="2" rx="1" />
          <rect x="5" y="15" width="10" height="2" rx="1" />
        </svg>
        Premium Select
      </SdkButton>
    </div>
  );
});

SelectButton.displayName = "SelectButton";
