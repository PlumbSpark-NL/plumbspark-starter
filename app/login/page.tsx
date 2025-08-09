"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) window.location.href = "/dashboard";
    });
  }, []);

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/dashboard`
            : undefined,
      },
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <div className="max-w-md mx-auto card p-6">
      <h1 className="text-xl font-semibold">Sign in</h1>
      {sent ? (
        <p className="text-sm mt-3 text-gray-700">
          Check your email for a magic link.
        </p>
      ) : (
        <form onSubmit={sendMagicLink} className="mt-4 grid gap-3">
          <label>Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            required
            type="email"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn mt-2">Send magic link</button>
        </form>
      )}
      <p className="text-xs text-gray-500 mt-4">
        Secure login via email. No password needed.
      </p>
    </div>
  );
}
