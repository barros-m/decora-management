import type { ReactNode } from "react";

import { DashboardSidebar } from "./DashboardSidebar";

type DashboardShellProps = {
  userName?: string | null;
  children: ReactNode;
};

export function DashboardShell({ userName, children }: DashboardShellProps) {
  const displayName = userName || "Team Member";

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-primary-soft to-background lg:h-screen lg:overflow-hidden">
      <div className="mx-auto max-w-[1480px] px-4 py-5 lg:h-full lg:px-0 lg:py-0">
        <div className="grid min-h-[calc(100vh-2.5rem)] gap-4 lg:h-full lg:min-h-0 lg:grid-cols-[300px_1fr] lg:gap-0">
          <DashboardSidebar userName={displayName} />
          <main className="rounded-3xl border border-primary/15 bg-white/75 p-7 ring-1 ring-primary/10 lg:h-full lg:overflow-y-auto lg:rounded-none lg:border-0 lg:bg-transparent lg:ring-0 lg:px-12 lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
