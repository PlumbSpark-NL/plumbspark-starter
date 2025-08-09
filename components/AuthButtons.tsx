"use client";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export default function AuthButtons() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setLoggedIn(!!data.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      supabase.auth.getUser().then(({ data }) => setLoggedIn(!!data.user));
    });
    return () => { sub?.subscription.unsubscribe(); mounted = false; };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <nav className="ml-auto flex gap-3">
      {loggedIn ? (
        <>
          <Link href="/dashboard" className="btn-secondary">Dashboard</Link>
          <Link href="/new-quote" className="btn">New Quote</Link>
          <button onClick={signOut} className="btn-secondary">Sign out</button>
        </>
      ) : (
        <Link href="/login" className="btn">Sign in</Link>
      )}
    </nav>
  );
}
