import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function GET(request) {
  const url = new URL(request.url);
  if (!isSupabaseConfigured) {
    return redirectToPasswordForm(true);
  }
  let invalidLink = false;
  try {
    const supabase = await createClient();
    const code = url.searchParams.get("code");
    const tokenHash = url.searchParams.get("token_hash");
    let result;
    if (code) result = await supabase.auth.exchangeCodeForSession(code);
    else if (tokenHash && url.searchParams.get("type") === "recovery") {
      result = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "recovery" });
    }
    invalidLink = !result || Boolean(result.error);
  } catch {
    invalidLink = true;
  }
  return redirectToPasswordForm(invalidLink);
}

function redirectToPasswordForm(invalidLink) {
  // A relative Location preserves the browser's origin and the new session cookie.
  // Next can normalize 127.0.0.1 to localhost in request.url behind the proxy.
  return new NextResponse(null, {
    status: 307,
    headers: {
      Location: `/restablecer-contrasena${invalidLink ? "?error=invalid_link" : ""}`,
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    },
  });
}
