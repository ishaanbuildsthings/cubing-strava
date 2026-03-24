import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js proxy (middleware) — runs BEFORE every matched request, before
// server components render and before the response starts streaming.
//
// Request lifecycle:
// 1. Browser sends HTTP request (cookies attached automatically)
// 2. THIS PROXY runs first — refreshes expired JWT if needed, updates cookies
// 3. Next.js routes the request to the matching page/API route
// 4. Server components render (can read cookies but NOT write them)
//    OR tRPC API route runs (createTRPCContext reads cookies → viewer context)
// 5. Response streams back to browser (including any Set-Cookie headers
//    from step 2, so the browser stores the updated token)
//
// Why this exists: Server components use HTTP streaming (RSC), so once
// they start rendering, the response headers are already being sent.
// You can't add a Set-Cookie header after that — that's how HTTP works
// (headers first, then body). Since token refresh requires writing a
// new cookie, it must happen here — the only point where the response
// hasn't started yet and we can freely set headers.
//
// Where it runs: On Vercel, middleware runs on the Edge runtime (a
// lightweight runtime close to the user), separate from the serverless
// functions that run your server components and API routes.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
