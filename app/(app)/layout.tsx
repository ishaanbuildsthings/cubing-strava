import { redirect } from "next/navigation";
import { caller } from "@/lib/trpc/server";

// Auth guard for all pages inside the (app) route group.
// Calls auth.status to determine the user's state:
// - unauthenticated → redirect to /login
// - needs-profile → redirect to /create-profile
// - ready → render the page
//
// Pages in the (auth) route group (login, create-profile) are NOT
// wrapped by this layout, so they're always accessible.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const trpc = await caller();
  const status = await trpc.auth.status();

  if (status.state === "unauthenticated") {
    redirect("/login");
  }

  if (status.state === "needs-profile") {
    redirect("/create-profile");
  }

  return <>{children}</>;
}
