import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import DashboardShell from "./_components/DashboardShell";

/**
 * Auth gate for everything under /dashboard.
 *
 * A server layout is the right place for it: Clerk deprecated matching paths
 * in middleware because that matching can diverge from how Next actually
 * routes a request, leaving a protected page reachable. This check sits in
 * the same tree as the data, so nothing below it can render without a
 * session, and the server actions each verify the session again anyway.
 */
export default async function DashboardLayout({ children }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return <DashboardShell>{children}</DashboardShell>;
}
