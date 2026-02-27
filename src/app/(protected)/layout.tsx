import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { DashboardShell } from "@/src/components/dashboard/DashboardShell";
import { authOptions } from "@/src/server/authOptions";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <DashboardShell userName={session.user.name}>{children}</DashboardShell>;
}

