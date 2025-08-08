"use client";
import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";

type Item = { description: string; qty: number; unitCost: number; };
type Quote = {
  id: string;
  clientName: string;
  projectTitle: string;
  items: Item[];
  notes: string;
  createdAt: string;
};

const calcTotal = (items: Item[]) => items.reduce((sum,i)=> sum + i.qty * i.unitCost, 0);

export default function QuoteDetail(){
  const params = useParams<{ id: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(()=>{
    const q = localStorage.getItem(`ps_quote_${params.id}`);
    if(q){ setQuote(JSON.parse(q)); }
  }, [params.id]);

  if (!quote) return <div className="text-gray-600">Loading…</div>;

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">{quote.projectTitle}</h1>
      <div className="card p-6">
        <div className="grid md:grid-cols-2 gap-2">
          <div><strong>Client:</strong> {quote.clientName}</div>
          <div><strong>Date:</strong> {new Date(quote.createdAt).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <table>
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Description</th>
              <th className="p-3">Qty</th>
              <th className="p-3">Unit</th>
              <th className="p-3">Line total</th>
            </tr>
          </thead>
          <tbody>
            {quote.items.map((i, idx)=> (
              <tr key={idx} className="border-t">
                <td className="p-3">{i.description}</td>
                <td className="p-3">{i.qty}</td>
                <td className="p-3">£{i.unitCost.toFixed(2)}</td>
                <td className="p-3">£{(i.qty * i.unitCost).toFixed(2)}</td>
              </tr>
            ))}
            <tr className="border-t font-semibold">
              <td className="p-3" colSpan={3}>Total</td>
              <td className="p-3">£{calcTotal(quote.items).toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold">Proposal</h2>
        <p className="whitespace-pre-wrap text-gray-700">{quote.notes || "—"}</p>
      </div>
    </div>
  );
}
