"use client";

import { useContext } from "react";
import type { IUser } from "@/lib/transforms/user";
import { ViewerContext } from "@/lib/context/viewer";

// Returns the current authenticated user. Only works inside the (app)
// route group where ViewerProvider is mounted. Throws if used outside.
export function useViewer(): IUser {
  const viewer = useContext(ViewerContext);
  if (!viewer) {
    throw new Error("useViewer must be used within the (app) route group");
  }
  return viewer;
}
