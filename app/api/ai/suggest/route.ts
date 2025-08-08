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
    };

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
    const output = data?.output ?? data?.choices ?? null;

    // 1) data.output[0].content[0].json (preferred)
    le
