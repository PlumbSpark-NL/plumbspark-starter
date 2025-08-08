"use client";
import { useState } from "react";

export default function LoginPage(){
  const [email, setEmail] = useState("");
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // DEV-ONLY placeholder "auth"
    localStorage.setItem("ps_user", email || "demo@plumbspark.app");
    window.location.href = "/dashboard";
  };
  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-xl font-semibold">Login</h1>
      <p className="text-sm text-gray-600">Developer login (placeholder)</p>
      <form onSubmit={onSubmit} className="mt-4 grid gap-3">
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" />
        <button className="btn mt-2">Continue</button>
      </form>
      <p className="text-xs text-gray-500 mt-4">
        In production, this will be replaced by proper auth (e.g., Supabase/NextAuth).
      </p>
    </div>
  );
}
