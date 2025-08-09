"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Row = {
  id: string;
  client_name: string;
  project_title: string;
  total: number;
  created_at: string;
};

export default function DashboardPage(){
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        window.location.href = "/login";
        return;
      }
      const { data, error } = await supabase
        .from("quotes")
        .select("id, client_name, project_title, total, created_at")
        .order("created_at", { ascending: false });
      if (error) console.error(error);
      setRows(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="text-gray-600">Loading…</div>;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <Link href="/new-quote" className="btn">New Quote</Link>
      </div>
      <div className="card p-0 overflow-hidden">
        <table>
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3">Client</th>
              <th className="p-3">Project</th>
              <th className="p-3">Total</th>
              <th className="p-3">Created</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td className="p-4 text-gray-500" colSpan={5}>No quotes yet.</td></tr>
            )}
            {rows.map(q => (
              <tr key={q.id} className="border-t">
                <td className="p-3">{q.client_name}</td>
                <td className="p-3">{q.project_title}</td>
                <td className="p-3">£{(q.total ?? 0).toFixed(2)}</td>
                <td className="p-3">{new Date(q.created_at).toLocaleString()}</td>
                <td className="p-3 text-right">
                  <Link className="btn-secondary" href={`/quote/${q.id}`}>Open</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
