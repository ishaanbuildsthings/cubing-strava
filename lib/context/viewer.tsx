"use client";

import { createContext } from "react";
import type { IUser } from "@/lib/transforms/user";

// The current authenticated user, available to any component inside the
// (app) route group. Set once by the server-side (app)/layout.tsx from
// auth.whoAmI, so there's no duplicate client-side auth check needed.
export const ViewerContext = createContext<IUser | null>(null);

export function ViewerProvider({
  user,
  children,
}: {
  user: IUser;
  children: React.ReactNode;
}) {
  return (
    <ViewerContext.Provider value={user}>{children}</ViewerContext.Provider>
  );
}
