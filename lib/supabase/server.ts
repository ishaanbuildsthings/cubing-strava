import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";

// Creates a Supabase client for server-side code (tRPC context, server
// components, API routes). Used ONLY for auth operations (reading the
// current user from cookies) — never for data fetching. All data access
// goes through Prisma.
//
// This is a FUNCTION, not a singleton — each request gets its own client
// wired to its own cookies. A shared global would read the wrong user's
// cookies.
//
// cookies() is a Next.js function that uses AsyncLocalStorage to access
// the current request's cookies. It only works within the request
// lifecycle (server components, API routes, tRPC handlers). Calling it
// outside a request (e.g. a background job) would throw an error.
//
// "server-only" import prevents client components from importing this.
// Client components use lib/supabase/browser.ts instead.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    publicEnv().NEXT_PUBLIC_SUPABASE_URL,
    publicEnv().NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      // @supabase/ssr needs to know how to read/write cookies in this
      // framework. You never call getAll/setAll yourself — the Supabase
      // client calls them internally when you use methods like
      // supabase.auth.getUser().
      cookies: {
        // Called internally by Supabase when it needs the JWT/refresh
        // token. For example, when auth.status calls getUser(), the
        // library calls getAll() to find the token cookie, reads the
        // JWT, and uses it to identify the user.
        getAll() {
          return cookieStore.getAll();
        },
        // Called internally by Supabase when it refreshes an expiring
        // token and needs to persist the new JWT. For example, if
        // getUser() detects the JWT is about to expire, the library
        // refreshes it and calls setAll() to write the new token cookie.
        //
        // This works in API routes and the proxy (they can set response
        // headers), but FAILS in server components (which are read-only
        // — they render HTML and can't modify headers). The try/catch
        // silently swallows the error. This is safe because the proxy
        // already handles token refresh before server components run.
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Silently fails in server components where cookies are
            // read-only. The proxy handles token refresh instead.
          }
        },
      },
    }
  );
}
