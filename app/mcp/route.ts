import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { recommendJewellery } from "@/lib/recommendation";

// CORS headers — needed so ChatGPT can reach this endpoint cross-origin
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Content, Authorization, Mcp-Session-Id, MCP-Protocol-Version",
};

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  Object.entries(CORS_HEADERS).forEach(([k, v]) => headers.set(k, v));
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// Fetch an image URL and return it as a base64 data + mimeType
// This is the KEY: ChatGPT's vision can then actually SEE the jewellery image
async function fetchImageAsBase64(
  url: string
): Promise<{ data: string; mimeType: string } | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType =
      res.headers.get("content-type")?.split(";")[0] ?? "image/png";
    return { data: base64, mimeType };
  } catch {
    return null;
  }
}

function buildServer(): McpServer {
  const server = new McpServer({
    name: "Jewellery Stylist",
    version: "1.0.0",
  });

  // ── recommend_jewellery ───────────────────────────────────────────────────
  server.registerTool(
    "recommend_jewellery",
    {
      title: "Recommend Jewellery with Virtual Try-On",
      description:
        "Suggests the best jewellery from our catalogue based on occasion, outfit colour, outfit type, and style. " +
        "Returns up to 3 ranked products. IMPORTANT: The tool response contains the actual jewellery images as embedded base64 image blocks — you can visually see each jewellery design. " +
        "ALSO: The text contains markdown image links — YOU MUST display these images to the user by including them in your response using the provided markdown syntax. " +
        "\n\nCONVERSATIONAL FLOW TO FOLLOW STRICTLY:\n" +
        "STEP 1 — Display each recommendation WITH its image shown to the user. Ask: 'Which one do you like? (1, 2, or 3)'\n" +
        "STEP 2 — After user picks one, ask: '✨ Would you like to try this on virtually?'\n" +
        "STEP 3 — If user says yes, give them TWO options:\n" +
        "  • Option A: 'Upload just your portrait/face photo — I will place the jewellery around your neck'\n" +
        "  • Option B: 'Upload your outfit/dress photo + your face photo — I will place the jewellery on your full look'\n" +
        "STEP 4 — After user uploads photo(s), use YOUR BUILT-IN IMAGE GENERATION to composite the jewellery onto their uploaded photo. " +
        "The jewellery image is already visible in this conversation — use it as the source for compositing. " +
        "Preserve the person's face, skin, outfit, and background exactly. Only add the jewellery naturally around the neck. High quality, photorealistic.",
      inputSchema: {
        occasion: z
          .string()
          .optional()
          .describe(
            "The occasion or event, e.g. 'wedding', 'engagement', 'reception', 'party'"
          ),
        outfitColor: z
          .string()
          .optional()
          .describe(
            "The dominant colour of the outfit, e.g. 'red', 'navy', 'white', 'black'"
          ),
        outfitType: z
          .string()
          .optional()
          .describe(
            "The type of outfit being worn, e.g. 'saree', 'lehenga', 'gown', 'western_dress', 'indo_western'"
          ),
        style: z
          .string()
          .optional()
          .describe(
            "The desired jewellery style, e.g. 'bridal', 'royal', 'modern', 'elegant', 'luxury', 'antique'"
          ),
      },
    },
    async (args) => {
      const results = recommendJewellery(args);

      if (results.length === 0) {
        return {
          content: [
            {
              type: "text",
              text: "No matching jewellery found for the given preferences. Try broadening your criteria.",
            },
          ],
        };
      }

      // Fetch all jewellery images as base64 in parallel
      // (used as image content blocks so ChatGPT vision sees the exact design for try-on)
      const imageResults = await Promise.all(
        results.map((p) => fetchImageAsBase64(p.image))
      );

      // Build one text block per product — each includes:
      //   • product details
      //   • markdown image tag → ChatGPT MUST render this as a visible image in its reply
      const productBlocks = results
        .map(
          (p, i) =>
            `**Option ${i + 1}: ${p.name}**\n` +
            `💰 Price: ₹${p.price.toLocaleString("en-IN")} | ` +
            `✨ Intensity: ${p.aiTags.lookIntensity} | ` +
            `⭐ Match: ${p.score}/100\n` +
            `🎨 Style: ${p.aiTags.styleTags.join(", ")}\n` +
            `🎉 Occasions: ${p.aiTags.occasionTags.join(", ")}\n` +
            `👗 Best with: ${p.aiTags.bestOutfitColours.join(", ")} | ${p.aiTags.bestOutfitTypes.join(", ")}\n\n` +
            // ↓ This markdown image tag makes ChatGPT fetch & display the actual jewellery photo
            `![${p.name}](${p.image})`
        )
        .join("\n\n---\n\n");

      const fullText =
        `Here are your top jewellery recommendations:\n\n` +
        productBlocks +
        `\n\n---\n` +
        `👆 Images shown above are the actual jewellery pieces. ` +
        `**Which one do you like? Reply with 1, 2, or 3.**`;

      // Content array: text with markdown images first,
      // then base64 image blocks for ChatGPT's vision (try-on compositing)
      type TextContent = { type: "text"; text: string };
      type ImageContent = { type: "image"; data: string; mimeType: string };
      const content: (TextContent | ImageContent)[] = [
        { type: "text", text: fullText },
      ];

      // Append base64 image blocks — ChatGPT's vision processes these
      // to visually understand each jewellery design for accurate try-on generation
      results.forEach((p, i) => {
        const img = imageResults[i];
        if (img) {
          content.push({
            type: "text",
            text: `[Vision reference for try-on — Option ${i + 1}: ${p.name}]`,
          });
          content.push({
            type: "image",
            data: img.data,
            mimeType: img.mimeType,
          });
        }
      });

      return { content };
    }
  );

  return server;
}

async function handleMcpRequest(req: Request): Promise<Response> {
  // Stateless mode: no sessionIdGenerator → no session management.
  // This is required for serverless/edge environments (Next.js App Router).
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
  });

  const server = buildServer();
  await server.connect(transport);

  const response = await transport.handleRequest(req);
  return withCors(response);
}

// Handle CORS pre-flight
export async function OPTIONS(): Promise<Response> {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

// GET — used for SSE streams by the Streamable HTTP spec
export async function GET(req: Request): Promise<Response> {
  return handleMcpRequest(req);
}

// POST — main JSON-RPC message channel (initialize, tools/list, tools/call …)
export async function POST(req: Request): Promise<Response> {
  return handleMcpRequest(req);
}

// DELETE — used by clients to terminate a session
export async function DELETE(req: Request): Promise<Response> {
  return handleMcpRequest(req);
}