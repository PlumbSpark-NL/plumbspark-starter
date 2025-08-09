"use client";
import { useEffect, useState } from "react";
import { generateWithAI } from "@/lib/api";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Item = { description: string; qty: number; unitCost: number; };

export default function NewQuotePage(){
  const [clientName, setClientName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [brief, setBrief] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = "/login";
      else setReady(true);
    });
  }, []);

  if (!ready) return <div className="text-gray-600">Checking auth…</div>;

  const total = items.reduce((sum,i)=> sum + i.qty * i.unitCost, 0);

  const addItem = () => setItems([...items, { description:"", qty:1, unitCost:0 }]);
  const updateItem = (idx:number, patch: Partial<Item>) => {
    setItems(items.map((it,i)=> i===idx ? { ...it, ...patch } : it));
  };
  const removeItem = (idx:number) => setItems(items.filter((_,i)=> i!==idx));

  const onAI = async () => {
    setLoading(true);
    try{
      const res = await generateWithAI({
        brief,
        region: "London, UK",
        currency: "GBP",
        includeProposal: true
      });
      setItems(res.items || []);
      setNotes(res.proposal || "");
    } catch (e:any){
      alert(e.message || "AI error");
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes?.user;
    if (!user) return window.location.assign("/login");

    const { data: quote, error: qErr } = await supabase
      .from("quotes")
      .insert([{
        user_id: user.id,
        client_name: clientName,
        project_title: projectTitle,
        notes
      }])
      .select("id")
      .single();

    if (qErr || !quote) {
      alert(qErr?.message || "Failed to create quote");
      return;
    }

    if (items.length) {
      const payload = items.map(i => ({
        quote_id: quote.id,
        description: i.description,
        qty: i.qty,
        unit_cost: i.unitCost
      }));
      const { error: iErr } = await supabase.from("quote_items").insert(payload);
      if (iErr) {
        alert(iErr.message);
        return;
      }
    }

    window.location.href = `/quote/${quote.id}`;
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">New Quote</h1>
        <div className="flex gap-2">
          <button onClick={save} className="btn">Save</button>
          <Link href="/dashboard" className="btn-secondary">Cancel</Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6 grid gap-3">
          <label>Client name</label>
          <input value={clientName} onChange={e=>setClientName(e.target.value)} />

          <label>Project title</label>
          <input value={projectTitle} onChange={e=>setProjectTitle(e.target.value)} />

          <label>Project brief (for AI)</label>
          <textarea rows={6} value={brief} onChange={e=>setBrief(e.target.value)} placeholder="e.g., 3-bed loft conversion, 45 sqm, in London..." />

          <button onClick={onAI} disabled={loading} className="btn">{loading ? "Thinking..." : "Generate with AI"}</button>
          <p className="text-xs text-gray-500">Requires OPENAI_API_KEY to be set.</p>
        </div>

        <div className="card p-6 grid gap-4">
          <h2 className="font-semibold">Items</h2>
          <div className="grid gap-3">
            {items.map((it, idx)=>(
              <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                <input className="col-span-7" value={it.description} onChange={e=>updateItem(idx, { description: e.target.value })} placeholder="Description" />
                <input className="col-span-2" type="number" value={it.qty} onChange={e=>updateItem(idx, { qty: Number(e.target.value) })} placeholder="Qty" />
                <input className="col-span-2" type="number" value={it.unitCost} onChange={e=>updateItem(idx, { unitCost: Number(e.target.value) })} placeholder="Unit cost" />
                <button className="col-span-1 btn-secondary" onClick={()=>removeItem(idx)}>✕</button>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button className="btn-secondary" onClick={addItem}>Add item</button>
            <div className="text-right font-semibold">Total: £{total.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold">Proposal / Notes</h2>
        <textarea rows={8} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Client-facing summary..." />
      </div>
    </div>
  );
}
