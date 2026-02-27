"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { InquiryStatusBadge } from "@/src/components/inquiries/InquiryStatusBadge";
import type { InquiryListItem } from "@/src/server/repositories/inquiryRepository";
import type { InquiryStatus } from "@prisma/client";

type InquiriesTableProps = {
  inquiries: InquiryListItem[];
};

type FilterKey = "ALL" | "NEW" | "QUOTED" | "BOOKED" | "LOST";

const FILTERS: { label: string; value: FilterKey }[] = [
  { label: "All", value: "ALL" },
  { label: "New", value: "NEW" },
  { label: "Quoted", value: "QUOTED" },
  { label: "Booked", value: "BOOKED" },
  { label: "Lost", value: "LOST" },
];

const FILTER_STATUSES: Record<FilterKey, InquiryStatus[]> = {
  ALL: [],
  NEW: ["NEW"],
  QUOTED: ["QUOTED_WAITING", "WAITING_ON_CLIENT"],
  BOOKED: ["BOOKED", "ACCEPTED_NOT_BOOKED"],
  LOST: ["LOST", "DISQUALIFIED", "EXPIRED"],
};

function formatDate(value: Date | string | null) {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function InquiriesTable({ inquiries }: InquiriesTableProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("ALL");

  const filtered = useMemo(() => {
    if (activeFilter === "ALL") return inquiries;
    const statuses = FILTER_STATUSES[activeFilter];
    return inquiries.filter((i) => statuses.includes(i.status));
  }, [inquiries, activeFilter]);

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(({ label, value }) => {
          const count =
            value === "ALL"
              ? inquiries.length
              : inquiries.filter((i) =>
                  FILTER_STATUSES[value].includes(i.status),
                ).length;
          const isActive = activeFilter === value;
          return (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={[
                "inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "border border-stone-200 bg-white text-stone-500 hover:border-primary/30 hover:text-primary",
              ].join(" ")}
            >
              {label}
              <span
                className={[
                  "rounded-full px-1.5 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-white/25 text-primary-foreground"
                    : "bg-stone-100 text-stone-500",
                ].join(" ")}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[2rem] border border-primary/15 bg-white/95 py-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="mt-3 text-sm font-semibold text-stone-700">
            No inquiries found
          </p>
          <p className="mt-1 text-xs text-stone-400">
            {activeFilter === "ALL"
              ? "Create your first inquiry to start tracking leads."
              : "No records match this filter."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[2rem] border border-primary/15 bg-white/95">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-primary/10 bg-primary-soft">
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-stone-700">
                    Client
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-stone-700">
                    Event
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-stone-700">
                    Date
                  </th>
                  <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wide text-stone-700">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-stone-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {filtered.map((inquiry) => (
                  <tr
                    key={inquiry.id}
                    className="transition-colors hover:bg-primary/5"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {initials(inquiry.contactName)}
                        </div>
                        <div>
                          <p className="font-semibold text-stone-900">
                            {inquiry.contactName}
                          </p>
                          <p className="text-xs text-stone-400">
                            {inquiry.contactEmail}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-600">
                      {inquiry.eventType}
                    </td>
                    <td className="px-6 py-4 text-stone-500">
                      {formatDate(inquiry.eventDate)}
                    </td>
                    <td className="px-6 py-4">
                      <InquiryStatusBadge status={inquiry.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/inquiries/${inquiry.id}`}
                          className="rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition hover:bg-primary/10"
                        >
                          View
                        </Link>
                        <Link
                          href={`/inquiries/${inquiry.id}/edit`}
                          className="rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-500 transition hover:border-primary/20 hover:text-primary"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
