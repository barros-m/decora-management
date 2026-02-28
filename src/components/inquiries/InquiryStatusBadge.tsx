import type { InquiryStatus } from "@prisma/client";

type InquiryStatusBadgeProps = {
  status: InquiryStatus;
};

const STATUS_CONFIG: Record<string, { label: string; dot: string; pill: string }> = {
  NEW: {
    label: "New",
    dot: "bg-primary",
    pill: "bg-primary/10 text-primary border-primary/20",
  },
  IN_REVIEW: {
    label: "In Review",
    dot: "bg-blue-400",
    pill: "bg-blue-50 text-blue-700 border-blue-200",
  },
  WAITING_ON_CLIENT: {
    label: "Waiting",
    dot: "bg-amber-400",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
  },
  QUOTING: {
    label: "Quoting",
    dot: "bg-cyan-400",
    pill: "bg-cyan-50 text-cyan-700 border-cyan-200",
  },
  QUOTED_WAITING: {
    label: "Quoted",
    dot: "bg-amber-400",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
  },
  BOOKED: {
    label: "Booked",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  ACCEPTED_NOT_BOOKED: {
    label: "Accepted",
    dot: "bg-emerald-400",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  LOST: {
    label: "Lost",
    dot: "bg-stone-400",
    pill: "bg-stone-100 text-stone-600 border-stone-200",
  },
  DISQUALIFIED: {
    label: "Disqualified",
    dot: "bg-stone-400",
    pill: "bg-stone-100 text-stone-600 border-stone-200",
  },
  EXPIRED: {
    label: "Expired",
    dot: "bg-stone-300",
    pill: "bg-stone-50 text-stone-400 border-stone-200",
  },
};

const DEFAULT_CONFIG = {
  label: "Unknown",
  dot: "bg-blue-400",
  pill: "bg-blue-50 text-blue-700 border-blue-200",
};

export function InquiryStatusBadge({ status }: InquiryStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? DEFAULT_CONFIG;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.pill}`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`} aria-hidden />
      {config.label}
    </span>
  );
}
