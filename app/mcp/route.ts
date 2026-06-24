import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { z } from "zod";
import { recommendJewellery } from "@/lib/recommendation";

// CORS headers — needed so ChatGPT can reach this endpoint cross-origin
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version",
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

function buildServer(): McpServer {
  const server = new McpServer({
    name: "Jewellery Stylist",
    version: "1.0.0",
  });

  server.registerTool(
    "recommend_jewellery",
    {
      title: "Recommend Jewellery",
      description:
        "Suggests the best jewellery pieces from our catalogue based on the user's occasion, outfit colour, outfit type, and style preference. Returns up to 3 ranked products.",
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

      const formatted = results
        .map(
          (p, i) =>
            `${i + 1}. **${p.name}**\n` +
            `   - Price: ₹${p.price.toLocaleString("en-IN")}\n` +
            `   - Style: ${p.aiTags.styleTags.join(", ")}\n` +
            `   - Best for: ${p.aiTags.occasionTags.join(", ")}\n` +
            `   - Outfit colours: ${p.aiTags.bestOutfitColours.join(", ")}\n` +
            `   - Outfit types: ${p.aiTags.bestOutfitTypes.join(", ")}\n` +
            `   - Look intensity: ${p.aiTags.lookIntensity}\n` +
            `   - Image: ${p.image}\n` +
            `   - Match score: ${p.score}/100`
        )
        .join("\n\n");

      return {
        content: [
          {
            type: "text",
            text: `Here are the top jewellery recommendations:\n\n${formatted}`,
          },
        ],
      };
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