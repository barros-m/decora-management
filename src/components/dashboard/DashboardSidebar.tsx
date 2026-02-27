"use client";
import { useState, useRef, useEffect } from "react";
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

function UserPopover({ userName, isOpen, onClose }: { userName: string; isOpen: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className="absolute bottom-full left-0 mb-2 w-full rounded-lg border border-stone-200 bg-white shadow-lg"
    >
      <div className="px-4 py-3 border-b border-stone-100">
        <p className="text-sm font-semibold text-stone-900">{userName}</p>
        <p className="text-xs text-stone-500">Event Lead</p>
      </div>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full px-4 py-2 text-left text-sm font-medium text-stone-700 hover:bg-stone-50 transition flex items-center gap-2"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign out
      </button>
    </div>
  );
}

export function DashboardSidebar({ userName }: DashboardSidebarProps) {
  const pathname = usePathname();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside className="flex h-full w-full flex-col border border-primary/15 bg-white/90 backdrop-blur lg:rounded-none lg:border-r lg:border-l-0 lg:border-y-0 lg:bg-white/70">
      {/* Header */}
      <div className="border-b border-primary/15 bg-stone-50/60 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21s-7-4.35-7-10a4 4 0 0 1 7-2.65A4 4 0 0 1 19 11c0 5.65-7 10-7 10Z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-stone-900">Decora</p>
            <p className="text-xs font-medium text-stone-500">Florida Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {SIDEBAR_TABS.map((tab) => {
          const selected = isActive(tab.href);
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`flex h-11 w-full items-center gap-3 rounded-lg px-4 text-left text-sm font-medium transition-all ${
                selected
                  ? "bg-primary/15 text-primary shadow-sm"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <Icon name={tab.icon} />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-primary/10 px-4 py-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="relative w-full rounded-lg border border-primary/15 bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-left transition hover:border-primary/30 hover:bg-gradient-to-br hover:from-primary/15 hover:to-primary/10"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-900">{userName}</p>
                <p className="text-xs text-stone-500">Event Lead</p>
              </div>
              <svg
                viewBox="0 0 24 24"
                className={`h-4 w-4 text-stone-600 transition-transform ${isUserMenuOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M19 14l-7-7-7 7" />
              </svg>
            </div>
          </button>
          <UserPopover userName={userName} isOpen={isUserMenuOpen} onClose={() => setIsUserMenuOpen(false)} />
        </div>
      </div>
    </aside>
  );
}

export type { SidebarTab };
