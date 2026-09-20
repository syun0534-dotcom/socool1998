import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<NextResponse["cookies"]["set"]>[2];
};

export async function updateSession(request: NextRequest) {
  const cookiesToApply: CookieToSet[] = [];
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            cookiesToApply.push({ name, value, options });
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isLogin = path.startsWith("/login");
  const isAuth = path.startsWith("/auth");
  const isApi = path.startsWith("/api");
  const hasAuthCode = request.nextUrl.searchParams.has("code");

  const withCookies = (response: NextResponse) => {
    cookiesToApply.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options);
    });
    return response;
  };

  if (hasAuthCode && !isAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    return withCookies(NextResponse.redirect(url));
  }

  if (!user && !isLogin && !isAuth && !isApi) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return withCookies(NextResponse.redirect(url));
  }

  if (user && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return withCookies(NextResponse.redirect(url));
  }

  return supabaseResponse;
}
