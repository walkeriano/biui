import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  isSupabaseConfigured,
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase/config";

const protectedRoutes = ["/dashboard"];
const authRoutes = ["/acceso"];

export async function updateSession(request) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  let supabaseResponse = NextResponse.next({ request });

  if (!isSupabaseConfigured || (!isProtectedRoute && !isAuthRoute)) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims ?? null;

  if (isProtectedRoute && (error || !claims)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/acceso";
    redirectUrl.searchParams.set("next", pathname);

    const redirectResponse = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  if (isAuthRoute && claims) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/dashboard";
    redirectUrl.search = "";

    const redirectResponse = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}
