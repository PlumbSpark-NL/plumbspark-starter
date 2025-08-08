export async function generateWithAI(payload: {
  brief: string;
  region?: string;
  currency?: string;
  includeProposal?: boolean;
}){
  const res = await fetch("/api/ai/suggest", {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify(payload),
  });
  if(!res.ok){
    const msg = await res.text();
    throw new Error(msg || "AI error");
  }
  return res.json();
}
