import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import Sidebar from "@/components/app/Sidebar";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "MANAGER" && session.user.role !== "ADMIN")
    redirect("/login");

  return (
    <div className="min-h-dvh bg-zinc-50">
      <div className="mx-auto flex min-h-dvh w-full max-w-[1400px]">
        <aside className="hidden w-72 shrink-0 border-r border-zinc-200 bg-white md:block">
          <Sidebar
            userName={session.user.name ?? "Manager"}
            userEmail={session.user.email ?? ""}
            userRole={session.user.role}
          />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
