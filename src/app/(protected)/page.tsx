import { getServerSession } from "next-auth/next";

import { DashboardOverview } from "@/src/components/dashboard/DashboardOverview";
import { authOptions } from "@/src/server/authOptions";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Team Member";

  return <DashboardOverview userName={userName} />;
}

