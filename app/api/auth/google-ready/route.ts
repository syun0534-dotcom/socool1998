import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return NextResponse.json(
      { ok: false, error: "Supabase 설정이 없습니다." },
      { status: 500 },
    );
  }

  const origin = new URL(request.url).origin;
  const target = new URL("/auth/v1/authorize", supabaseUrl);
  target.searchParams.set("provider", "google");
  target.searchParams.set("redirect_to", `${origin}/auth/callback`);
  target.searchParams.set("code_challenge", "google-ready-probe".padEnd(43, "0"));
  target.searchParams.set("code_challenge_method", "s256");

  const response = await fetch(target, {
    redirect: "manual",
    headers: { Accept: "application/json" },
  });

  if (response.status >= 300 && response.status < 400) {
    return NextResponse.json({ ok: true });
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as {
      msg?: string;
      error_description?: string;
    };
    return NextResponse.json(
      {
        ok: false,
        error:
          payload.msg ??
          payload.error_description ??
          "Google 로그인을 시작할 수 없습니다.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
