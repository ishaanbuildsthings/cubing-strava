"use client";

import { createContext, useState } from "react";
import type { IUser } from "@/lib/transforms/user";

// Holds the current authenticated user and a setter to update it
// (e.g., after a profile edit). Set initially by the server-side
// (app)/layout.tsx from auth.whoAmI.
export const ViewerContext = createContext<{
  viewer: IUser;
  setViewer: (user: IUser) => void;
} | null>(null);

export function ViewerProvider({
  user: initialUser,
  children,
}: {
  user: IUser;
  children: React.ReactNode;
}) {
  const [viewer, setViewer] = useState<IUser>(initialUser);

  return (
    <ViewerContext.Provider value={{ viewer, setViewer }}>
      {children}
    </ViewerContext.Provider>
  );
}
