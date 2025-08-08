"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

type Quote = {
  id: string;
  clientName: string;
  projectTitle: string;
  total: number;
  createdAt: string;
};

export default function DashboardPage(){
  const [quotes, setQuotes] = useState<Quote[]>([]);
  useEffect(()=>{
    const data = JSON.parse(localStorage.getItem("ps_quotes") || "[]");
    setQuotes(data);
  },[]);

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
            {quotes.length === 0 && (
              <tr><td className="p-4 text-gray-500" colSpan={5}>No quotes yet.</td></tr>
            )}
            {quotes.map(q => (
              <tr key={q.id} className="border-t">
                <td className="p-3">{q.clientName}</td>
                <td className="p-3">{q.projectTitle}</td>
                <td className="p-3">£{q.total.toFixed(2)}</td>
                <td className="p-3">{new Date(q.createdAt).toLocaleString()}</td>
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
