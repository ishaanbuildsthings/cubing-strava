import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";

// Called by the proxy (middleware) on every request. Refreshes the
// Supabase auth token if it's expired and writes updated cookies.
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    publicEnv().NEXT_PUBLIC_SUPABASE_URL,
    publicEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // Reads the JWT/refresh token from the incoming request cookies.
        getAll() {
          return request.cookies.getAll();
        },
        // Called by the Supabase library when it refreshes the token.
        // Writes the new token to TWO places:
        // 1. request.cookies — so server components and tRPC context
        //    that run AFTER this proxy see the fresh token.
        // 2. supabaseResponse.cookies — so the browser receives the
        //    updated cookie in the Set-Cookie response header.
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard
  // to debug issues with users being randomly logged out.

  // getClaims() checks the JWT locally (no network call). If the token
  // is expired, the Supabase library automatically refreshes it using
  // the refresh token, which triggers setAll() above to update cookies.
  // Removing this will cause users to be randomly logged out.
  await supabase.auth.getClaims();

  // IMPORTANT: You *must* return supabaseResponse (not a new response),
  // because it contains the updated Set-Cookie headers. Creating a new
  // response would lose those cookies, causing the browser and server
  // to go out of sync and terminate the user's session.
  return supabaseResponse;
}
