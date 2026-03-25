import { redirect } from "next/navigation";
import { caller } from "@/lib/trpc/server";
import { ViewerProvider } from "@/lib/context/viewer";
import { AuthButton } from "@/lib/components/auth-button";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const trpc = await caller();
  const session = await trpc.auth.whoAmI();

  if (session.state === "unauthenticated") {
    redirect("/login");
  }

  if (session.state === "needs-profile") {
    redirect("/create-profile");
  }

  return (
    <ViewerProvider user={session.user}>
      <header className="flex items-center justify-between border-b px-6 py-3">
        <a href="/" className="font-bold">Cubing Strava</a>
        <AuthButton />
      </header>
      {children}
    </ViewerProvider>
  );
}
