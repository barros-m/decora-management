"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  Settings,
  User,
  ChevronUp,
} from "lucide-react";

type NavItemDef = {
  href: string;
  label: string;
  icon: React.ElementType;
};

const navItems: NavItemDef[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/budget-requests", label: "Budget Requests", icon: FileText },
];

function NavItem({ href, label, icon: Icon }: NavItemDef) {
  const pathname = usePathname();
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-emerald-900 text-white"
          : "text-zinc-700 hover:bg-zinc-100",
      ].join(" ")}
    >
      <Icon size={17} className="shrink-0" />
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex h-full flex-col px-4 py-5">
      {/* Logo */}
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

      {/* Navigation */}
      <nav className="mt-6 space-y-1">
        {navItems.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* User card with popup */}
      <div className="relative mt-auto" ref={menuRef}>
        {/* Popup menu */}
        {menuOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-2 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg">
            <div className="px-4 py-3 border-b border-zinc-100">
              <p className="truncate text-sm font-medium text-zinc-900">
                {userName}
              </p>
              <p className="truncate text-xs text-zinc-500">{userEmail}</p>
            </div>
            <div className="p-1.5 space-y-0.5">
              <button
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <User size={15} className="shrink-0 text-zinc-500" />
                Profile
              </button>
              <button
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Settings size={15} className="shrink-0 text-zinc-500" />
                Settings
              </button>
              <div className="my-1 border-t border-zinc-100" />
              <button
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut size={15} className="shrink-0" />
                Sign out
              </button>
            </div>
          </div>
        )}

        {/* Trigger button */}
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex w-full items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-3 text-left transition-colors hover:bg-zinc-100"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-900 text-white text-xs font-semibold">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-900">
              {userName}
            </p>
            <p className="truncate text-xs text-zinc-500">
              {userRole === "ADMIN" ? "Admin" : "Manager"}
            </p>
          </div>
          <ChevronUp
            size={15}
            className={[
              "shrink-0 text-zinc-400 transition-transform",
              menuOpen ? "rotate-180" : "",
            ].join(" ")}
          />
        </button>
      </div>
    </div>
  );
}
