export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12051e] to-[#0d0821] flex flex-col items-center justify-center px-6 py-16 font-sans text-white">
      {/* Glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-purple-700/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-rose-700/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 text-center max-w-2xl w-full">
        {/* Badge */}
        <span className="inline-flex items-center gap-2 rounded-full border border-purple-500/40 bg-purple-950/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-purple-300 backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-purple-400" />
          MCP Server · Live
        </span>

        {/* Headline */}
        <div className="flex flex-col gap-3">
          <h1 className="text-5xl font-bold tracking-tight leading-tight bg-gradient-to-r from-amber-200 via-rose-300 to-purple-300 bg-clip-text text-transparent">
            AI Jewellery Stylist
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Smart jewellery recommendations + photorealistic virtual try-on —
            all inside ChatGPT. Zero extra API keys.
          </p>
        </div>

        {/* MCP endpoint card */}
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col gap-4">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
            ChatGPT MCP Endpoint
          </p>
          <code className="block rounded-xl bg-black/50 border border-white/10 px-5 py-3 text-sm text-amber-300 font-mono break-all text-left">
            https://&lt;your-domain&gt;/mcp
          </code>
          <p className="text-xs text-zinc-500">
            ChatGPT → Settings → Connectors → Add MCP server → paste URL above
          </p>
        </div>

        {/* How it works — step by step */}
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col gap-5 text-left">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
            Full Conversation Flow
          </p>

          <div className="flex flex-col gap-4">
            {[
              {
                step: "1",
                color: "bg-purple-500/20 border-purple-500/30 text-purple-300",
                title: "Tell your occasion",
                desc: 'Say "I\'m wearing a red lehenga for wedding" or upload your dress photo (optional)',
              },
              {
                step: "2",
                color: "bg-amber-500/20 border-amber-500/30 text-amber-300",
                title: "AI recommends + shows jewellery",
                desc: "Tool fetches matching pieces from catalogue and returns actual jewellery images — ChatGPT visually sees each design, not just a URL",
              },
              {
                step: "3",
                color: "bg-rose-500/20 border-rose-500/30 text-rose-300",
                title: "Pick your favourite",
                desc: 'Reply "1", "2", or "3" — AI asks "Would you like to try this on?"',
              },
              {
                step: "4",
                color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
                title: "Choose try-on mode",
                desc: "Option A: Upload your portrait photo only\nOption B: Upload your outfit photo + face photo",
              },
              {
                step: "5",
                color: "bg-blue-500/20 border-blue-500/30 text-blue-300",
                title: "✨ Try-on generated!",
                desc: "ChatGPT uses its native image generation to composite the jewellery onto your photo — photorealistic, zero API key",
              },
            ].map(({ step, color, title, desc }) => (
              <div key={step} className="flex items-start gap-4">
                <span
                  className={`shrink-0 w-7 h-7 rounded-full border ${color} flex items-center justify-center text-xs font-bold`}
                >
                  {step}
                </span>
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <p className="text-xs text-zinc-500 whitespace-pre-line">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* The KEY insight card */}
        <div className="w-full rounded-2xl border border-amber-500/30 bg-amber-950/20 backdrop-blur-md p-5 flex flex-col gap-3 text-left">
          <p className="text-xs uppercase tracking-widest text-amber-500/70 font-semibold">
            🔑 How ChatGPT Actually Sees the Jewellery
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed">
            The MCP tool fetches each jewellery image from Cloudinary and returns it as a{" "}
            <code className="text-amber-300 text-xs bg-black/30 px-1 py-0.5 rounded">
              base64 image content block
            </code>{" "}
            — not just a URL string. This means ChatGPT&apos;s vision model literally{" "}
            <span className="text-white font-medium">sees the exact jewellery design</span>.
            When the user then uploads their photo, ChatGPT has both visuals in context
            and can generate an accurate try-on composite.
          </p>
        </div>

        {/* Tool card */}
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col gap-4 text-left">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
            MCP Tool
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="rounded-lg bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-sm font-mono text-purple-300">
              recommend_jewellery
            </span>
          </div>
          <div className="rounded-xl bg-black/40 border border-white/5 p-4 flex flex-col gap-2">
            {[
              ["occasion", "wedding · engagement · reception · party"],
              ["outfitColor", "red · navy · white · black · green …"],
              ["outfitType", "saree · lehenga · gown · indo_western …"],
              ["style", "bridal · royal · modern · elegant · luxury …"],
            ].map(([param, hint]) => (
              <div
                key={param}
                className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3"
              >
                <span className="font-mono text-xs text-rose-300 shrink-0">{param}</span>
                <span className="text-xs text-zinc-500">{hint}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-zinc-600">
          Powered by a catalogue of{" "}
          <span className="text-zinc-300 font-semibold">6 curated pieces</span>{" "}
          · Images served from Cloudinary · Try-on via ChatGPT native image generation
        </p>
      </div>
    </main>
  );
}
