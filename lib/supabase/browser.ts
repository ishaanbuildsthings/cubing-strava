"use client";

import { createBrowserClient } from "@supabase/ssr";

// We reference NEXT_PUBLIC_ vars directly here so Next.js can inline
// them at build time. Using publicEnv() adds a runtime indirection
// that can prevent Next.js from replacing the values.
export function createBrowserSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createBrowserClient(url, anonKey);
}
