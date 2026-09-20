"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const projectRef = supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\.co/)?.[1] ?? "";
const GOOGLE_PROVIDER_URL = projectRef
  ? `https://supabase.com/dashboard/project/${projectRef}/auth/providers`
  : "https://supabase.com/dashboard";
const GOOGLE_CALLBACK_URI = supabaseUrl
  ? `${supabaseUrl.replace(/\/$/, "")}/auth/v1/callback`
  : "";

type GoogleStatus = "checking" | "ready" | "setup";

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pending, setPending] = useState<"google" | "signin" | "signup" | null>(
    null,
  );
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus>("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;

    if (params.get("code") || hash.includes("access_token")) {
      window.location.replace(
        `/auth/callback${window.location.search}${hash}`,
      );
      return;
    }

    if (params.get("error") === "auth") {
      setErrorMessage(
        "로그인에 실패했습니다. 설정을 확인한 뒤 다시 시도하세요.",
      );
    }

    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        window.location.replace("/");
      }
    });

    void refreshGoogleStatus();
  }, []);

  async function refreshGoogleStatus(): Promise<boolean> {
    try {
      const check = await fetch("/api/auth/google-ready");
      const result = (await check.json()) as { ok?: boolean };
      const ready = Boolean(check.ok && result.ok);
      setGoogleStatus(ready ? "ready" : "setup");
      return ready;
    } catch {
      setGoogleStatus("setup");
      return false;
    }
  }

  async function signInWithGoogle() {
    setPending("google");
    setErrorMessage(null);

    try {
      const ready = googleStatus === "ready" ? true : await refreshGoogleStatus();
      if (!ready) {
        setErrorMessage(
          "아직 Google provider가 꺼져 있습니다. 아래 설정 후 ‘다시 확인’을 눌러 주세요.",
        );
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setErrorMessage(toUserMessage(error.message));
      }
    } catch (error: unknown) {
      setErrorMessage(
        error instanceof Error
          ? toUserMessage(error.message)
          : "Google 로그인을 시작할 수 없습니다.",
      );
    } finally {
      setPending(null);
    }
  }

  async function signInWithEmail() {
    setPending("signin");
    setErrorMessage(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMessage(toUserMessage(error.message));
      setPending(null);
      return;
    }

    window.location.assign("/");
  }

  async function signUpWithEmail() {
    setPending("signup");
    setErrorMessage(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      setErrorMessage(toUserMessage(error.message));
      setPending(null);
      return;
    }

    if (data.session) {
      window.location.assign("/");
      return;
    }

    setErrorMessage(
      "가입은 되었지만 이메일 확인이 필요합니다. 메일을 확인하거나, 확인이 꺼져 있으면 바로 로그인해 보세요.",
    );
    setPending(null);
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <h1>메모</h1>
        <p>계정으로 로그인하세요</p>
        {errorMessage ? <p className="login-error">{errorMessage}</p> : null}
        <form
          className="login-form"
          onSubmit={(event) => {
            event.preventDefault();
            void signInWithEmail();
          }}
        >
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="이메일"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
          />
          <div className="login-actions">
            <button
              type="submit"
              className="login-button"
              disabled={pending !== null}
            >
              {pending === "signin" ? "로그인 중..." : "로그인"}
            </button>
            <button
              type="button"
              className="login-button secondary"
              disabled={pending !== null}
              onClick={() => {
                void signUpWithEmail();
              }}
            >
              {pending === "signup" ? "가입 중..." : "회원가입"}
            </button>
          </div>
        </form>
        <p className="login-divider">또는</p>
        <button
          type="button"
          className="login-button"
          disabled={pending !== null || googleStatus === "checking"}
          onClick={() => {
            void signInWithGoogle();
          }}
        >
          {pending === "google" || googleStatus === "checking"
            ? "확인 중..."
            : "Google로 계속하기"}
        </button>
        {googleStatus === "setup" ? (
          <div className="google-setup">
            <p>
              Google 로그인은 Supabase에서 provider를 켠 뒤에 사용할 수 있습니다.
            </p>
            <ol>
              <li>
                <a
                  href="https://console.cloud.google.com/apis/credentials"
                  target="_blank"
                  rel="noreferrer"
                >
                  Google Cloud
                </a>
                에서 웹 OAuth 클라이언트를 만듭니다.
              </li>
              <li>
                승인된 리디렉션 URI에 다음을 넣습니다.
                <code>{GOOGLE_CALLBACK_URI}</code>
              </li>
              <li>
                <a href={GOOGLE_PROVIDER_URL} target="_blank" rel="noreferrer">
                  Supabase Google provider
                </a>
                를 켜고 Client ID/Secret을 저장합니다.
              </li>
            </ol>
            <button
              type="button"
              className="login-button secondary"
              disabled={pending !== null}
              onClick={() => {
                void refreshGoogleStatus();
              }}
            >
              설정 후 다시 확인
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function toUserMessage(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("not enabled")) {
    return "아직 Google provider가 꺼져 있습니다. 아래 설정 후 ‘다시 확인’을 눌러 주세요.";
  }
  if (lower.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  if (lower.includes("user already registered")) {
    return "이미 가입된 이메일입니다. 로그인해 주세요.";
  }
  return message;
}
