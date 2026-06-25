/**
 * @file ProductImage.tsx
 * Handles image loading, error fallback, and skeleton shimmer for a product image.
 *
 * Apps SDK NOTE: Uses the `Image` component from `@openai/apps-sdk-ui`.
 * The SDK's `Image` component gracefully handles load failures by returning
 * `null` instead of a broken `<img>` tag — we detect this via `onError` to
 * show our own luxury fallback.
 */

"use client";

import { Image as SdkImage } from "@openai/apps-sdk-ui/components/Image";
import React, { memo, useCallback, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ProductImageProps {
  /** Remote URL of the jewellery image */
  src: string;
  /** Alt text for screen readers */
  alt: string;
  /** Whether this card is highlighted as the top recommendation */
  isRecommended?: boolean;
}

// ---------------------------------------------------------------------------
// Fallback
// ---------------------------------------------------------------------------

/** Shown when the image URL fails to load — a decorative jewellery silhouette */
function ImageFallback() {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2"
      role="img"
      aria-label="Jewellery image unavailable"
    >
      {/* Diamond SVG silhouette */}
      <svg
        viewBox="0 0 64 64"
        className="h-14 w-14 opacity-20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M32 4L52 20L32 60L12 20L32 4Z"
          stroke="#b8933a"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M12 20H52M32 4L22 20L32 60M32 4L42 20L32 60"
          stroke="#b8933a"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-[10px] font-medium text-amber-700/50 tracking-wider uppercase">
        Image unavailable
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * `ProductImage` renders the jewellery image with:
 * - Skeleton shimmer while loading
 * - Graceful fallback on error (uses Apps SDK Image onError)
 * - Subtle golden border glow for recommended products
 */
export const ProductImage = memo<ProductImageProps>(function ProductImage({
  src,
  alt,
  isRecommended = false,
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const handleLoad = useCallback(() => setLoaded(true), []);
  const handleError = useCallback(() => {
    setLoaded(true); // stop shimmer
    setErrored(true);
  }, []);

  return (
    <div
      className={[
        "relative h-56 w-full overflow-hidden rounded-t-2xl bg-[#faf8f5]",
        // Subtle golden ring for the recommended card
        isRecommended ? "ring-2 ring-amber-400/40 ring-inset" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Skeleton shimmer — shown until image loads */}
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#f5f0e8] via-[#ede5d4] to-[#f5f0e8]"
          aria-hidden="true"
        />
      )}

      {errored ? (
        <ImageFallback />
      ) : (
        /*
         * Apps SDK Image component — gracefully returns null on load failure
         * instead of rendering a broken <img> tag.
         * We pair it with our own onError to trigger the fallback UI.
         */
        <SdkImage
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          draggable={false}
          className={[
            "h-full w-full object-cover transition-opacity duration-500",
            loaded ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />
      )}
    </div>
  );
});

ProductImage.displayName = "ProductImage";
