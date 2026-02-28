"use client";

import { useState, useRef, useEffect } from "react";
import type { InquiryStatus } from "@prisma/client";

import { updateInquiryStatusAction } from "@/src/app/(protected)/inquiries/[id]/actions";
import { InquiryStatusBadge } from "@/src/components/inquiries/InquiryStatusBadge";

const NEGATIVE_STATUSES: InquiryStatus[] = ["LOST", "DISQUALIFIED", "EXPIRED"];
const REOPEN_SOURCE_STATUSES: InquiryStatus[] = ["LOST", "DISQUALIFIED", "EXPIRED"];

// Mirrors STATUS_STAGE from inquiryStateValidator — kept here to avoid
// importing server code into a client component.
const STATUS_STAGE: Partial<Record<InquiryStatus, number>> = {
  NEW: 0,
  IN_REVIEW: 1,
  WAITING_ON_CLIENT: 2,
  QUOTING: 3,
  QUOTED_WAITING: 4,
  ACCEPTED_NOT_BOOKED: 5,
  BOOKED: 6,
};

type Variant = "forward" | "back" | "danger" | "reopen";

function resolveVariant(from: InquiryStatus, to: InquiryStatus): Variant {
  if (REOPEN_SOURCE_STATUSES.includes(from)) return "reopen";
  if (NEGATIVE_STATUSES.includes(to)) return "danger";
  const fromStage = STATUS_STAGE[from];
  const toStage = STATUS_STAGE[to];
  if (fromStage !== undefined && toStage !== undefined && toStage < fromStage) return "back";
  return "forward";
}

function getLabel(status: InquiryStatus): string {
  const labels: Record<InquiryStatus, string> = {
    NEW: "New",
    IN_REVIEW: "In Review",
    WAITING_ON_CLIENT: "Waiting on Client",
    QUOTING: "Quoting",
    QUOTED_WAITING: "Quoted — Waiting",
    ACCEPTED_NOT_BOOKED: "Accepted (Not Booked)",
    BOOKED: "Booked",
    LOST: "Lost",
    DISQUALIFIED: "Disqualified",
    EXPIRED: "Expired",
  };
  return labels[status] ?? status.replaceAll("_", " ");
}

type StatusTransitionSelectProps = {
  inquiryId: string;
  fromStatus: InquiryStatus;
  validTransitions: InquiryStatus[];
};

export function StatusTransitionSelect({
  inquiryId,
  fromStatus,
  validTransitions,
}: StatusTransitionSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<InquiryStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const options = validTransitions.map((status) => ({
    value: status,
    label: getLabel(status),
    variant: resolveVariant(fromStatus, status),
  }));

  const forwardOptions = options.filter((o) => o.variant === "forward");
  const backOptions   = options.filter((o) => o.variant === "back");
  const dangerOptions = options.filter((o) => o.variant === "danger");
  const reopenOptions = options.filter((o) => o.variant === "reopen");

  const filtered = (list: typeof options) =>
    query.trim()
      ? list.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
      : list;

  const filteredForward = filtered(forwardOptions);
  const filteredBack    = filtered(backOptions);
  const filteredDanger  = filtered(dangerOptions);
  const filteredReopen  = filtered(reopenOptions);
  const hasResults =
    filteredForward.length + filteredBack.length + filteredDanger.length + filteredReopen.length > 0;

  const handleSelect = (status: InquiryStatus, variant: Variant) => {
    setOpen(false);
    setQuery("");
    if (variant === "danger" || variant === "reopen" || variant === "back") {
      setPending(status);
    } else {
      execute(status);
    }
  };

  const execute = async (status: InquiryStatus) => {
    setIsLoading(true);
    setError(null);
    setPending(null);
    try {
      const result = await updateInquiryStatusAction({ inquiryId, newStatus: status });
      if (result.error) setError(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  if (validTransitions.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Combobox trigger */}
      <div ref={containerRef} className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          disabled={isLoading}
          className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-500 transition hover:border-primary/40 hover:text-primary disabled:opacity-50"
        >
          <span>{isLoading ? "Updating..." : "Change status"}</span>
          <svg
            viewBox="0 0 24 24"
            className={`h-3 w-3 shrink-0 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 top-full z-20 mt-1.5 w-72 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg">
            {/* Search input */}
            <div className="flex items-center gap-2 border-b border-stone-100 px-3 py-2.5">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 text-stone-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search status..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none"
              />
            </div>

            <div className="max-h-64 overflow-y-auto py-1">
              {!hasResults && (
                <p className="px-4 py-3 text-xs text-stone-400">No matching status found.</p>
              )}

              {filteredForward.length > 0 && (
                <Group label="Move to">
                  {filteredForward.map((o) => (
                    <Option key={o.value} option={o} onSelect={handleSelect} />
                  ))}
                </Group>
              )}

              {filteredBack.length > 0 && (
                <Group label="Go back to">
                  {filteredBack.map((o) => (
                    <Option key={o.value} option={o} onSelect={handleSelect} />
                  ))}
                </Group>
              )}

              {filteredReopen.length > 0 && (
                <Group label="Reopen">
                  {filteredReopen.map((o) => (
                    <Option key={o.value} option={o} onSelect={handleSelect} />
                  ))}
                </Group>
              )}

              {filteredDanger.length > 0 && (
                <Group label="Close as">
                  {filteredDanger.map((o) => (
                    <Option key={o.value} option={o} onSelect={handleSelect} />
                  ))}
                </Group>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Confirmation prompt */}
      {pending && (
        <ConfirmPrompt
          fromStatus={fromStatus}
          toStatus={pending}
          label={getLabel(pending)}
          variant={resolveVariant(fromStatus, pending)}
          isLoading={isLoading}
          onConfirm={() => execute(pending)}
          onCancel={() => setPending(null)}
        />
      )}

      {/* Error message */}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* ─── Subcomponents ─────────────────────────────────────────────────────── */

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-4 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400">
        {label}
      </p>
      {children}
    </div>
  );
}

type OptionItem = { value: InquiryStatus; label: string; variant: Variant };

function Option({
  option,
  onSelect,
}: {
  option: OptionItem;
  onSelect: (status: InquiryStatus, variant: Variant) => void;
}) {
  const iconClass =
    option.variant === "danger"  ? "text-red-400"    :
    option.variant === "reopen"  ? "text-stone-400"  :
    option.variant === "back"    ? "text-violet-400" :
    "text-primary/60";

  return (
    <button
      onClick={() => onSelect(option.value, option.variant)}
      className="flex w-full items-center gap-3 px-4 py-2 text-sm transition hover:bg-stone-50"
    >
      {option.variant === "danger" ? (
        /* × close */
        <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 shrink-0 ${iconClass}`} fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : option.variant === "reopen" ? (
        /* ↩ reopen */
        <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 shrink-0 ${iconClass}`} fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
        </svg>
      ) : option.variant === "back" ? (
        /* ← go back */
        <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 shrink-0 ${iconClass}`} fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
        </svg>
      ) : (
        /* → forward */
        <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 shrink-0 ${iconClass}`} fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      )}
      <InquiryStatusBadge status={option.value} />
    </button>
  );
}

function ConfirmPrompt({
  fromStatus,
  toStatus,
  label,
  variant,
  isLoading,
  onConfirm,
  onCancel,
}: {
  fromStatus: InquiryStatus;
  toStatus: InquiryStatus;
  label: string;
  variant: Variant;
  isLoading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isDanger = variant === "danger";
  const isBack   = variant === "back";
  const wrapClass = isDanger ? "border-red-200 bg-red-50"
    : isBack   ? "border-violet-200 bg-violet-50"
    : "border-stone-200 bg-stone-50";
  const textClass = isDanger ? "text-red-700" : isBack ? "text-violet-700" : "text-stone-700";
  const confirmClass = isDanger
    ? "bg-red-600 hover:bg-red-700 text-white"
    : isBack
    ? "bg-violet-600 hover:bg-violet-700 text-white"
    : "bg-stone-700 hover:bg-stone-800 text-white";
  const message = isDanger
    ? "This will close the inquiry."
    : isBack
    ? "Go back to this status?"
    : "Reopen this inquiry?";

  return (
    <div className={`flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-3 ${wrapClass}`}>
      <div className="flex items-center gap-2">
        <InquiryStatusBadge status={fromStatus} />
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-stone-400" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <InquiryStatusBadge status={toStatus} />
      </div>
      <p className={`text-xs ${textClass}`}>{message}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition disabled:opacity-50 ${confirmClass}`}
        >
          {isLoading ? "Updating..." : "Confirm"}
        </button>
        <button
          onClick={onCancel}
          className="text-xs text-stone-400 hover:text-stone-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
