"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  const [message, setMessage] = useState("로그인 처리 중...");

  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") ?? "/";
    const destination = next.startsWith("/") ? next : "/";
    const code = params.get("code");
    const oauthError = params.get("error");

    async function complete() {
      if (oauthError) {
        window.location.replace("/login?error=auth");
        return;
      }

      const { data: existing } = await supabase.auth.getSession();
      if (existing.session) {
        window.location.replace(destination);
        return;
      }

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage(error.message);
          window.location.replace("/login?error=auth");
          return;
        }
        window.location.replace(destination);
        return;
      }

      const { data: afterHash } = await supabase.auth.getSession();
      if (afterHash.session) {
        window.location.replace(destination);
        return;
      }

      window.location.replace("/login?error=auth");
    }

    void complete();
  }, []);

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>메모</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}
