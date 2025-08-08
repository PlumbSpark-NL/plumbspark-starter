import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){
  const { brief, region = "London, UK", currency = "GBP", includeProposal = true } = await req.json();

  const apiKey = process.env.OPENAI_API_KEY;
  if(!apiKey){
    return new NextResponse("Missing OPENAI_API_KEY", { status: 500 });
  }

  // Use the Responses API via fetch to avoid SDK complexity
  const prompt = `You are an estimator for plumbing/building quotes. 
Brief: ${brief}
Region: ${region}
Currency: ${currency}

Return a short JSON with fields:
items: array of { description, qty, unitCost }
proposal: a concise client-facing summary (if includeProposal is true).
Unit costs must be realistic for the region & scenario, and keep qty reasonable.
`;

  const body = {
    model: "gpt-4o-mini",
    input: [
      { role: "system", content: "Return ONLY valid JSON that can be parsed. No commentary." },
      { role: "user", content: prompt }
    ]
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

  // The Responses API can return text in data.output_text; fall back to choices if needed.
  const outputText = data.output_text || data.choices?.[0]?.message?.content || "";
  try{
    const parsed = JSON.parse(outputText);
    return NextResponse.json(parsed);
  } catch {
    // Attempt to extract JSON block if the model added formatting
    const match = outputText.match(/\{[\s\S]*\}/);
    if(match){
      try{
        const parsed = JSON.parse(match[0]);
        return NextResponse.json(parsed);
      } catch {}
    }
    return new NextResponse("Failed to parse AI output: " + outputText.slice(0, 400), { status: 500 });
  }
}
