// app/api/ai/suggest/route.ts
import { NextRequest, NextResponse } from "next/server";

/** Safely coerce to a non-negative finite number with a default */
function toNumber(n: any, def = 0) {
  const x = Number(n);
  return Number.isFinite(x) && x >= 0 ? x : def;
}

/** Try multiple strategies to extract JSON from Responses API payload */
function extractJsonFromResponse(data: any): any | null {
  // 1) Preferred: structured JSON
  const structured = data?.output?.[0]?.content?.find((c: any) => "json" in c)?.json;
  if (structured && typeof structured === "object") return structured;

  // 2) Fallback: output_text string (stringified JSON)
  const text = typeof data?.output_text === "string" ? data.output_text : null;
  if (text) {
    try { return JSON.parse(text); } catch { /* keep trying */ }
    // 3) Last resort: extract the first JSON object via regex
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* ignore */ }
    }
  }

  // 4) Super defensive: walk any text nodes inside content[] for JSON
  const content = Array.isArray(data?.output?.[0]?.content) ? data.output[0].content : [];
  for (const part of content) {
    if (typeof part?.text === "string" && part.text.trim()) {
      try { return JSON.parse(part.text); } catch {
        const m = part.text.match(/\{[\s\S]*\}/);
        if (m) { try { return JSON.parse(m[0]); } catch {} }
      }
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const { brief, region = "London, UK", currency = "GBP", includeProposal = true } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return new NextResponse("Missing OPENAI_API_KEY", { status: 500 });

    const prompt = `You are an estimator for plumbing/building quotes.
Brief: ${brief}
Region: ${region}
Currency: ${currency}

Return ONLY the fields defined by the provided JSON schema.
All unitCost values must be numbers in ${currency}. Quantities must be positive numbers.
If includeProposal is false, return an empty string for proposal.`;

    // Strict JSON schema
    const jsonSchema = {
      name: "QuoteSuggestion",
      schema: {
        type: "object",
        additionalProperties: false,
        properties: {
          items: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              properties: {
                description: { type: "string" },
                qty: { type: "number", minimum: 0 },
                unitCost: { type: "number", minimum: 0 }
              },
              required: ["description", "qty", "unitCost"]
            }
          },
          proposal: { type: "string" }
        },
        required: ["items"]
      },
      strict: true
    } as const;

    const body = {
      model: "gpt-4o-mini",
      // New Responses API: use input
      input: [
        { role: "system", content: "You output only valid JSON matching the provided schema. Do not include markdown or explanations." },
        { role: "user", content: prompt },
        { role: "user", content: `includeProposal=${includeProposal}` }
      ],
      temperature: 0.2,
      // New Responses API: JSON schema formatting lives under text.format
      text: {
        format: {
          type: "json_schema",
          json_schema: jsonSchema
        }
      }
      // You can add: max_output_tokens: 800,
    };

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const t = await r.text();
      return new NextResponse(t || "AI request failed", { status: 500 });
    }

    const data = await r.json();
    const parsed = extractJsonFromResponse(data);
    if (!parsed || typeof parsed !== "object") {
      const snippet = (data?.output_text || "").toString().slice(0, 400);
      return new NextResponse("Failed to parse AI output." + (snippet ? " Snippet: " + snippet : ""), { status: 500 });
    }

    // Sanitize & clamp
    const rawItems = Array.isArray(parsed.items) ? parsed.items : [];
    const proposalRaw = typeof parsed.proposal === "string" ? parsed.proposal : "";

    const safeItems = rawItems
      .filter((i: any) => i && typeof i.description === "string" && i.description.trim())
      .slice(0, 200) // hard cap so a wild output can't explode the UI
      .map((i: any) => ({
        description: String(i.description).slice(0, 500),
        qty: toNumber(i.qty, 1),
        unitCost: toNumber(i.unitCost, 0)
      }))
      .map((i) => ({
        ...i,
        // Round to 2 dp for currency niceness
        qty: Math.round(i.qty * 100) / 100,
        unitCost: Math.round(i.unitCost * 100) / 100
      }));

    // If schema omitted proposal and user wanted one, keep empty string
    const proposal = includeProposal ? proposalRaw : "";

    return NextResponse.json({ items: safeItems, proposal });
  } catch (err: any) {
    // Return the error message but avoid leaking stack traces
    return new NextResponse(err?.message || "Server error", { status: 500 });
  }
}
