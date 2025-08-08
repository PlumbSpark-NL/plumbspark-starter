// app/api/ai/suggest/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
  try{
    const { brief, region = "London, UK", currency = "GBP", includeProposal = true } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;
    if(!apiKey){
      return new NextResponse("Missing OPENAI_API_KEY", { status: 500 });
    }

    const prompt = `You are an estimator for plumbing/building quotes.
Brief: ${brief}
Region: ${region}
Currency: ${currency}

Return ONLY the fields defined by the provided JSON schema.
All unitCost values must be numbers in ${currency}. Quantities must be positive numbers.
If includeProposal is false, return an empty string for proposal.`;

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
                qty: { type: "number" },
                unitCost: { type: "number" }
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
      messages: [
        { role: "system", content: "You output only valid JSON matching the provided schema. Do not include markdown or explanations." },
        { role: "user", content: prompt },
        { role: "user", content: `includeProposal=${includeProposal}` }
      ],
      temperature: 0.2,
      response_format: {
        type: "json_schema",
        json_schema: jsonSchema
      }
    };

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if(!r.ok){
      const text = await r.text();
      return new NextResponse(text, { status: 500 });
    }

    const data = await r.json();

    // Prefer structured JSON directly from the Responses API
    const output: any = data?.output ?? data?.choices ?? null;

    // 1) data.output[0].content[0].json (preferred)
    let jsonCandidate: any = output?.[0]?.content?.[0]?.json;

    // 2) Fallback: text that happens to be JSON
    if(!jsonCandidate){
      const maybeText: any = output?.[0]?.content?.[0]?.text ?? data?.output_text ?? "";
      if (typeof maybeText === "string" && maybeText.trim()) {
        try { jsonCandidate = JSON.parse(maybeText); } catch {}
      }
    }

    if(!jsonCandidate){
      return new NextResponse("Failed to parse AI output.", { status: 500 });
    }

    // Sanitize
    const items = Array.isArray(jsonCandidate.items) ? jsonCandidate.items : [];
    const proposal = typeof jsonCandidate.proposal === "string" ? jsonCandidate.proposal : "";
    const safeItems = items
      .filter((i: any) => i && typeof i.description === "string")
      .map((i: any) => ({
        description: i.description,
        qty: Number.isFinite(i.qty) ? i.qty : 1,
        unitCost: Number.isFinite(i.unitCost) ? i.unitCost : 0
      }));

    return NextResponse.json({ items: safeItems, proposal });
  } catch (err: any){
    return new NextResponse(err?.message || "Server error", { status: 500 });
  }
}
