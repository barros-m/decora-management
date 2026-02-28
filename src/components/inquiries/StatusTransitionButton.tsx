"use client";

import { useState } from "react";
import type { InquiryStatus } from "@prisma/client";

import { updateInquiryStatusAction } from "@/src/app/(protected)/inquiries/[id]/actions";

const NEGATIVE_STATUSES: InquiryStatus[] = ["LOST", "DISQUALIFIED", "EXPIRED"];
const REOPEN_SOURCE_STATUSES: InquiryStatus[] = ["LOST", "DISQUALIFIED", "EXPIRED"];

type Variant = "forward" | "danger" | "reopen";

type StatusTransitionButtonProps = {
  inquiryId: string;
  fromStatus: InquiryStatus;
  toStatus: InquiryStatus;
  label: string;
};

function resolveVariant(from: InquiryStatus, to: InquiryStatus): Variant {
  if (REOPEN_SOURCE_STATUSES.includes(from)) return "reopen";
  if (NEGATIVE_STATUSES.includes(to)) return "danger";
  return "forward";
}

const VARIANT_BUTTON: Record<Variant, string> = {
  forward:
    "border-primary/20 bg-primary/5 text-primary hover:bg-primary/10",
  danger:
    "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  reopen:
    "border-stone-300 bg-stone-50 text-stone-600 hover:bg-stone-100",
};

const CONFIRM_MESSAGE: Record<Variant, string> = {
  forward: "Confirm?",
  danger: "This will close the inquiry. Confirm?",
  reopen: "Reopen this inquiry?",
};

export function StatusTransitionButton({
  inquiryId,
  fromStatus,
  toStatus,
  label,
}: StatusTransitionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const variant = resolveVariant(fromStatus, toStatus);
  const needsConfirm = variant === "danger" || variant === "reopen";

  const execute = async () => {
    setIsLoading(true);
    setError(null);
    setConfirming(false);

    try {
      const result = await updateInquiryStatusAction({ inquiryId, newStatus: toStatus });
      if (result.error) setError(result.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (needsConfirm && !confirming) {
      setConfirming(true);
      return;
    }
    execute();
  };

  if (confirming) {
    const confirmStyle =
      variant === "reopen"
        ? "border-stone-300 bg-stone-50"
        : "border-red-200 bg-red-50";
    const textStyle =
      variant === "reopen" ? "text-stone-700" : "text-red-700";

    return (
      <div className={`flex items-center gap-2 rounded-2xl border px-3 py-2 ${confirmStyle}`}>
        <span className={`text-xs font-medium ${textStyle}`}>
          {CONFIRM_MESSAGE[variant]}
        </span>
        <button
          onClick={execute}
          disabled={isLoading}
          className={`text-xs font-semibold underline underline-offset-2 disabled:opacity-50 ${textStyle} hover:no-underline`}
        >
          {isLoading ? "..." : "Yes"}
        </button>
        <span className="text-stone-300">·</span>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs text-stone-400 hover:text-stone-600"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`rounded-full border px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${VARIANT_BUTTON[variant]}`}
      >
        {isLoading ? "..." : label}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
