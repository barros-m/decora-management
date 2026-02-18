"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavItem({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-emerald-900 text-white"
          : "text-zinc-700 hover:bg-zinc-100",
      ].join(" ")}
    >
      <span>{label}</span>
    </Link>
  );
}

export default function Sidebar({
  userName,
  userEmail,
  userRole,
}: {
  userName: string;
  userEmail: string;
  userRole: "ADMIN" | "MANAGER";
}) {
  return (
    <div className="flex h-full flex-col px-4 py-5">
      <div className="flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-900 text-white">
          <span className="text-xs font-semibold tracking-wide">DF</span>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-zinc-900">
            DeCora Florida
          </p>
          <p className="text-xs text-zinc-500">Event Management</p>
        </div>
      </div>

      <nav className="mt-6 space-y-1">
        <NavItem href="/dashboard" label="Dashboard" />
        <NavItem href="/budget-requests" label="Budget Requests" />
      </nav>

      <div className="mt-auto rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
        <p className="truncate text-sm font-medium text-zinc-900">{userName}</p>
        <p className="truncate text-xs text-zinc-500">{userEmail}</p>
        <p className="mt-3 text-xs text-zinc-500">
          Role: {userRole === "ADMIN" ? "Admin" : "Manager"}
        </p>
      </div>
    </div>
  );
}
