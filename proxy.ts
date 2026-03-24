import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js proxy (middleware) — runs BEFORE every matched request, before
// server components render and before the response starts streaming.
//
// Why this exists: Server components use HTTP streaming (RSC), so once
// they start rendering, the response headers are already being sent.
// You can't add a Set-Cookie header after that. Since token refresh
// requires writing a new cookie, it must happen here — the only point
// where the response hasn't started yet and we can freely set headers.
//
// What it does: Reads the JWT from cookies, checks if it's expired or
// about to expire, refreshes it if needed, and writes the updated
// token to both the request (so downstream code sees the fresh token)
// and the response (so the browser stores the new cookie).
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
