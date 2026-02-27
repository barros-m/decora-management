"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

type SidebarTab = {
  id: string;
  label: string;
  icon: string;
  href: string;
};

const SIDEBAR_TABS: SidebarTab[] = [
  { id: "dashboard", label: "Dashboard", icon: "grid", href: "/" },
  { id: "inquiries", label: "Inquiries", icon: "inbox", href: "/inquiries" },
  { id: "events", label: "Events", icon: "calendar", href: "/events" },
  { id: "vendors", label: "Vendors", icon: "users", href: "/vendors" },
];

function Icon({ name }: { name: string }) {
  if (name === "inbox") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 5h16v14H4z" />
        <path d="M4 15h5l2 3h2l2-3h5" />
      </svg>
    );
  }

  if (name === "calendar") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 5h18v16H3z" />
        <path d="M3 9h18" />
        <path d="M8 3v4M16 3v4" />
      </svg>
    );
  }

  if (name === "users") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="3" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a3 3 0 0 1 0 5.74" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}

type DashboardSidebarProps = {
  userName: string;
};

export function DashboardSidebar({ userName }: DashboardSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-full w-full flex-col border border-primary/15 bg-white/90 p-6 backdrop-blur lg:rounded-none lg:border-r lg:border-l-0 lg:border-y-0">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z" />
          </svg>
        </div>
        <div>
          <p className="text-xl font-semibold text-stone-900">Decora Florida</p>
          <p className="text-xs text-stone-500">Management</p>
        </div>
      </div>

      <nav className="space-y-2">
        {SIDEBAR_TABS.map((tab) => {
          const selected = isActive(tab.href);
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex h-12 w-full items-center gap-3 rounded-2xl px-4 text-left text-sm font-medium transition ${
                selected
                  ? "bg-primary/20 text-stone-900"
                  : "text-stone-600 hover:bg-primary/10 hover:text-stone-900"
              }`}
            >
              <Icon name={tab.icon} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4">
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4">
          <p className="text-sm font-semibold text-stone-800">{userName}</p>
          <p className="text-xs text-stone-500">Event Lead</p>
        </div>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="inline-flex h-11 w-full items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}

export type { SidebarTab };
