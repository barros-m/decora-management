import type { ProposalStatus } from "@prisma/client";

const STATUS_CONFIG: Record<
  ProposalStatus,
  { label: string; dot: string; pill: string }
> = {
  DRAFT: {
    label: "Draft",
    dot: "bg-stone-400",
    pill: "bg-stone-100 text-stone-600 border-stone-200",
  },
  SENT: {
    label: "Sent",
    dot: "bg-blue-400",
    pill: "bg-blue-50 text-blue-700 border-blue-200",
  },
  NEEDS_CHANGES: {
    label: "Needs Changes",
    dot: "bg-amber-400",
    pill: "bg-amber-50 text-amber-700 border-amber-200",
  },
  ACCEPTED: {
    label: "Accepted",
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Rejected",
    dot: "bg-red-400",
    pill: "bg-red-50 text-red-700 border-red-200",
  },
  EXPIRED: {
    label: "Expired",
    dot: "bg-stone-300",
    pill: "bg-stone-50 text-stone-400 border-stone-200",
  },
  SUPERSEDED: {
    label: "Superseded",
    dot: "bg-stone-300",
    pill: "bg-stone-50 text-stone-400 border-stone-200",
  },
};

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.DRAFT;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${config.pill}`}
    >
      <span
        className={`h-1.5 w-1.5 shrink-0 rounded-full ${config.dot}`}
        aria-hidden
      />
      {config.label}
    </span>
  );
}
