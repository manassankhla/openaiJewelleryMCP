export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0a0f] via-[#12051e] to-[#0d0821] flex flex-col items-center justify-center px-6 py-16 font-sans text-white">
      {/* Glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-purple-700/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full bg-rose-700/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-10 text-center max-w-2xl">
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
            A Model Context Protocol server that recommends the perfect jewellery
            from our curated catalogue — based on occasion, outfit, and style.
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
            Add this URL in ChatGPT → Settings → Connectors → Add MCP server
          </p>
        </div>

        {/* Tool card */}
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 flex flex-col gap-5 text-left">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
            Available Tool
          </p>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-lg bg-purple-500/20 border border-purple-500/30 px-3 py-1 text-sm font-mono text-purple-300">
                recommend_jewellery
              </span>
            </div>
            <p className="text-sm text-zinc-400">
              Returns up to 3 ranked jewellery pieces from our catalogue, scored
              against your occasion, outfit colour, outfit type, and style.
            </p>

            {/* Parameters */}
            <div className="mt-1 rounded-xl bg-black/40 border border-white/5 p-4 flex flex-col gap-2">
              {[
                ["occasion", "wedding · engagement · reception · party"],
                ["outfitColor", "red · navy · white · black · green …"],
                ["outfitType", "saree · lehenga · gown · indo_western …"],
                ["style", "bridal · royal · modern · elegant · luxury …"],
              ].map(([param, hint]) => (
                <div key={param} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                  <span className="font-mono text-xs text-rose-300 shrink-0">{param}</span>
                  <span className="text-xs text-zinc-500">{hint}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products count */}
        <p className="text-sm text-zinc-600">
          Powered by a catalogue of{" "}
          <span className="text-zinc-300 font-semibold">6 curated pieces</span>{" "}
          with AI-tagged attributes
        </p>
      </div>
    </main>
  );
}
