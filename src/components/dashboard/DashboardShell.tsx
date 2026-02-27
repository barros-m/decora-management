"use client";

import { useMemo, useState } from "react";

import { DashboardContent } from "./DashboardContent";
import { DashboardSidebar } from "./DashboardSidebar";

type DashboardShellProps = {
  userName?: string | null;
};

export function DashboardShell({ userName }: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const displayName = useMemo(() => userName || "Team Member", [userName]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-primary-soft to-background lg:h-screen lg:overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-4 py-4 lg:h-full lg:px-0 lg:py-0">
        <div className="grid min-h-[calc(100vh-2rem)] gap-4 lg:h-full lg:min-h-0 lg:grid-cols-[300px_1fr] lg:gap-0 lg:rounded-none">
          <DashboardSidebar activeTab={activeTab} onSelectTab={setActiveTab} userName={displayName} />
          <main className="rounded-3xl border border-primary/15 bg-white/70 p-6 shadow-xl ring-1 ring-primary/10 lg:h-full lg:overflow-y-auto lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none lg:ring-0 lg:p-10">
            <DashboardContent activeTab={activeTab} userName={displayName} />
          </main>
        </div>
      </div>
    </div>
  );
}
