"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Item = { description: string; qty: number; unit_cost: number; };
type Quote = {
  id: string;
  client_name: string;
  project_title: string;
  notes: string;
  total: number;
  created_at: string;
};

export default function QuoteDetail(){
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return (window.location.href = "/login");

      const [{ data: q, error: qe }, { data: its, error: ie }] = await Promise.all([
        supabase.from("quotes").select("*").eq("id", id).single(),
        supabase.from("quote_items").select("description, qty, unit_cost").eq("quote_id", id).order("id", { ascending: true })
      ]);
      if (qe) console.error(qe);
      if (ie) console.error(ie);
      setQuote(q || null);
      setItems(its || []);
      setLoading(false);
    })();
  }, [id]);

  if (loading) return <div className="text-gray-600">Loading…</div>;
  if (!quote) return <div className="text-gray-600">Not found</div>;

  const calcTotal = (arr: Item[]) => arr.reduce((s,i)=> s + Number(i.qty) * Number(i.unit_cost), 0);

  return (
    <div className="grid gap-4">
      <h1 className="text-2xl font-semibold">{quote.project_title}</h1>
      <div className="card p-6">
        <div className="grid md:grid-cols-2 gap-2">
          <div><strong>Client:</strong> {quote.client_name}</div>
          <div><strong>Date:</strong> {new Date(quote.created_at).toLocaleDateString()}</div>
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
            {items.map((i, idx)=> (
              <tr key={idx} className="border-t">
                <td className="p-3">{i.description}</td>
                <td className="p-3">{i.qty}</td>
                <td className="p-3">£{Number(i.unit_cost).toFixed(2)}</td>
                <td className="p-3">£{(Number(i.qty) * Number(i.unit_cost)).toFixed(2)}</td>
              </tr>
            ))}
            <tr className="border-t font-semibold">
              <td className="p-3" colSpan={3}>Total</td>
              <td className="p-3">£{calcTotal(items).toFixed(2)}</td>
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
