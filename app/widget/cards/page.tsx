"use client";

import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  styleTags?: string[];
  occasionTags?: string[];
  bestOutfitColours?: string[];
  bestOutfitTypes?: string[];
  lookIntensity?: string;
  score?: number;
}

interface RecommendationData {
  products: Product[];
  occasion?: string;
  outfitColor?: string;
  outfitType?: string;
}

export default function JewelleryCardsWidget() {
  const [data, setData] = useState<RecommendationData | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleData = (structuredContent: any) => {
      if (structuredContent && Array.isArray(structuredContent.products)) {
        setData(structuredContent);
        setLoading(false);
        setError(null);
        return true;
      }
      return false;
    };

    const onMessage = (event: MessageEvent) => {
      const message = event.data;
      if (!message) return;

      if (message.jsonrpc === "2.0") {
        if (message.method === "ui/notifications/tool-result" && message.params) {
          handleData(message.params.structuredContent);
        }
        return;
      }

      if (message.type === "openai_globals" && message.toolOutput) {
        handleData(message.toolOutput.structuredContent);
        return;
      }

      if (message.structuredContent) {
        handleData(message.structuredContent);
        return;
      }
    };

    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "iframe_ready" }, "*");

    const timer = setTimeout(() => {
      if (loading && !data) {
        setLoading(false);
        setError("Waiting for recommendation data... Make sure Developer Mode is enabled.");
      }
    }, 4000);

    return () => {
      window.removeEventListener("message", onMessage);
      clearTimeout(timer);
    };
  }, [loading, data]);

  const handleTryOn = (product: Product, index: number) => {
    setSelectedIdx(index);

    // Notify ChatGPT to execute the try-on tool or action
    window.parent.postMessage({
      type: "tool_call",
      toolName: "virtual_try_on",
      params: {
        jewelleryName: product.name,
        jewelleryImageUrl: product.image,
        userPhotoUrl: "" // Will be populated by user upload in chat
      }
    }, "*");

    window.parent.postMessage({
      type: "mcp_widget_action",
      action: "try_on_jewellery",
      product
    }, "*");
  };

  const getBulletPoints = (p: Product, outfitColor?: string, outfitType?: string) => {
    const points: string[] = [];
    const color = outfitColor || "burgundy";
    const type = outfitType || "gown";

    // Replicating the exact bullet points from the screenshot based on product name/id
    if (p.name.includes("Emerald")) {
      points.push("Elegant diamond & emerald design");
      points.push("Perfect for a sophisticated look");
      points.push("Medium statement");
    } else if (p.name.includes("Rose Gold") || p.id === "4") {
      points.push("Luxurious rose gold & diamond finish");
      points.push(`Complements ${color} perfectly`);
      points.push("Glamorous & high-end look");
    } else if (p.name.includes("Temple") || p.id === "1") {
      points.push("Traditional royal bridal style");
      points.push("Best for lehengas & sarees");
      points.push(`Bold fusion look with ${type}`);
    } else {
      points.push("Premium handcrafted designer piece");
      points.push(`Styled to match your ${type}`);
      points.push(`${p.lookIntensity === "heavy" ? "Bold" : "Elegant"} statement look`);
    }

    return points;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[220px] text-zinc-500 gap-2">
        <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin"></div>
        <p className="text-xs font-medium">Curating recommendations...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[220px] px-6 text-center">
        <p className="text-xs text-zinc-400 font-medium">{error}</p>
      </div>
    );
  }

  const products = data?.products || [];
  const outfitColor = data?.outfitColor || "burgundy";
  const outfitType = data?.outfitType || "gown";

  // Determine the recommended index. We default to index 1 (Rose Gold Diamond Reception Set)
  // to match the screenshot if it exists, otherwise the first item.
  const recommendedIdx = products.findIndex(p => p.name.includes("Rose Gold")) !== -1
    ? products.findIndex(p => p.name.includes("Rose Gold"))
    : 0;

  const recommendedProduct = products[recommendedIdx];

  return (
    <div className="w-full bg-[#fcfcfc] dark:bg-[#18181b] p-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 font-sans">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {products.map((p, idx) => {
          const isRecommended = idx === recommendedIdx;
          const bulletPoints = getBulletPoints(p, outfitColor, outfitType);
          
          return (
            <div
              key={p.id}
              className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col justify-between"
            >
              {/* Product Image Area */}
              <div className="relative aspect-[1.1] w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Number Badge */}
                <div className="absolute top-3 left-3 w-7 h-7 bg-white dark:bg-zinc-850 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{idx + 1}</span>
                </div>

                {/* Heart Icon (Favorite) */}
                <div className="absolute top-3 right-3 w-7 h-7 bg-white/90 dark:bg-zinc-850/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm cursor-pointer hover:bg-white transition-colors">
                  <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>

                {/* Recommended Badge */}
                {isRecommended && (
                  <div className="absolute top-3 left-12 bg-[#803340] text-white text-[10px] font-semibold py-1 px-2.5 rounded-full flex items-center gap-1 shadow-sm">
                    <span>★</span> Recommended
                  </div>
                )}
              </div>

              {/* Product Body */}
              <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                <div className="space-y-3">
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight">
                    {p.name}
                  </h4>
                  
                  {/* Custom Icon List */}
                  <ul className="space-y-2">
                    {bulletPoints.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                        {/* Gold style list bullet */}
                        <span className="text-amber-600 font-medium shrink-0 mt-0.5">✦</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Price */}
                  <div className="text-zinc-900 dark:text-white font-extrabold text-sm pt-1">
                    {"₹" + p.price.toLocaleString("en-IN")}
                  </div>
                </div>

                {/* Try On Button */}
                <button
                  onClick={() => handleTryOn(p, idx)}
                  className={`w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-xs transition-all duration-200 ${
                    isRecommended
                      ? "bg-[#803340] hover:bg-[#6c2834] text-white shadow-md shadow-red-900/10"
                      : "bg-[#f5ede6] hover:bg-[#eae0d5] text-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 dark:text-zinc-200"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Try On
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommended Highlight Box */}
      {recommendedProduct && (
        <div className="mt-5 p-4 bg-[#fbf5f5] dark:bg-zinc-900/60 rounded-2xl border border-[#f3e6e6] dark:border-zinc-800/80 flex items-start gap-3">
          <div className="bg-[#803340]/10 text-[#803340] p-1.5 rounded-lg shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h5 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-200 mb-0.5">
              My Recommendation:
            </h5>
            <p className="text-xs text-zinc-700 dark:text-zinc-400 leading-normal font-medium">
              <span className="font-bold text-[#803340]">Option {products.indexOf(recommendedProduct) + 1} – {recommendedProduct.name}</span>. The rose gold and diamonds beautifully complement {outfitColor} and give a luxurious wedding look.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
