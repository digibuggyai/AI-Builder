import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { CATEGORIES, type Catalog, type Category, type Selection } from "@pcb/shared";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { z } from "zod";
import { getCatalog } from "../context";

export const importRoutes = new Hono();

const MODEL = "claude-opus-5-5";
const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;

const importBody = z.union([
  z.object({ text: z.string().trim().min(3).max(20_000) }),
  z.object({ imageBase64: z.string().min(100).max(9_000_000), mediaType: z.enum(IMAGE_TYPES) }),
]);

const answerSchema = z.object({
  items: z.array(
    z.object({
      line: z.string(),
      category: z.enum(CATEGORIES).nullable(),
      slug: z.string().nullable(),
      confidence: z.enum(["high", "medium", "low"]),
    }),
  ),
});

const SYSTEM = `You read PC build lists: typed lists, shop quotations, invoices, chat messages, and screenshots or photos of them.
For every PC part in the input, find the matching product in the catalogue below.
Rules:
- Only use slugs that appear in the catalogue. If the exact product isn't listed, set slug to null.
- A different capacity, wattage, size or colour of the same model is not a match.
- Leave out things that aren't PC parts: keyboard, mouse, headphones, software licences, assembly, shipping, taxes.
- "line" is the part exactly as written in the input.
- confidence: "high" = clearly the same model, "medium" = very likely, "low" = a guess.`;

function catalogText(catalog: Catalog): string {
  return CATEGORIES.map((c) => `## ${c}\n${catalog[c].map((p) => `${p.slug} | ${p.name}`).join("\n")}`).join("\n\n");
}

let client: Anthropic | null = null;

importRoutes.post(
  "/import",
  bodyLimit({
    maxSize: 10 * 1024 * 1024,
    onError: (c) => c.json({ error: "That file is too big. Use an image under 5 MB." }, 413),
  }),
  async (c) => {
    if (!process.env.ANTHROPIC_API_KEY) return c.json({ error: "Import isn't set up on this server yet." }, 503);

    const parsed = importBody.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: "Send a parts list as text, or an image of one." }, 400);

    const catalog = await getCatalog();
    client ??= new Anthropic();

    const content: Anthropic.Beta.BetaContentBlockParam[] =
      "text" in parsed.data
        ? [{ type: "text", text: `<build_list>\n${parsed.data.text}\n</build_list>` }]
        : [
            { type: "image", source: { type: "base64", media_type: parsed.data.mediaType, data: parsed.data.imageBase64 } },
            { type: "text", text: "This image shows a PC build list. Read every part in it." },
          ];

    let response: Anthropic.Beta.BetaMessage;
    try {
      response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 4000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low", format: zodOutputFormat(answerSchema) },
        system: [{ type: "text", text: `${SYSTEM}\n\n<catalogue>\n${catalogText(catalog)}\n</catalogue>`, cache_control: { type: "ephemeral" } }],
        messages: [{ role: "user", content }],
      });
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) return c.json({ error: "Too many imports right now. Try again in a minute." }, 429);
      if (err instanceof Anthropic.BadRequestError) return c.json({ error: "We couldn't read that. Try a clearer image or paste the text." }, 400);
      console.error("Import failed:", err);
      return c.json({ error: "Import failed. Try again." }, 502);
    }

    if (response.stop_reason === "refusal") return c.json({ error: "We couldn't read that input." }, 422);
    const answer = response.content.find((b) => b.type === "text");
    const result = answer?.type === "text" ? answerSchema.safeParse(JSON.parse(answer.text)) : null;
    if (!result?.success) return c.json({ error: "We couldn't read that input." }, 422);

    const selection: Selection = {};
    const unmatched: string[] = [];
    const extras: string[] = [];

    for (const item of result.data.items) {
      const category = item.category as Category | null;
      const part = category && item.slug ? catalog[category].find((p) => p.slug === item.slug) : undefined;
      if (!category || !part || item.confidence === "low") {
        unmatched.push(item.line);
      } else if (selection[category]) {
        extras.push(item.line);
      } else {
        selection[category] = part.slug;
      }
    }

    return c.json({ selection, matched: Object.keys(selection).length, unmatched, extras });
  },
);
