import type { InquiryStatus } from "@prisma/client";

/**
 * Valid state transitions for Inquiry status.
 * Maps from current status to allowed next statuses.
 */
const VALID_TRANSITIONS: Record<InquiryStatus, InquiryStatus[]> = {
  NEW:                 ["IN_REVIEW", "WAITING_ON_CLIENT", "LOST", "DISQUALIFIED"],
  IN_REVIEW:           ["QUOTING", "WAITING_ON_CLIENT", "QUOTED_WAITING", "NEW", "LOST", "DISQUALIFIED"],
  WAITING_ON_CLIENT:   ["QUOTING", "QUOTED_WAITING", "IN_REVIEW", "NEW", "LOST", "EXPIRED"],
  QUOTING:             ["QUOTED_WAITING", "WAITING_ON_CLIENT", "IN_REVIEW", "LOST", "DISQUALIFIED"],
  QUOTED_WAITING:      ["ACCEPTED_NOT_BOOKED", "WAITING_ON_CLIENT", "QUOTING", "IN_REVIEW", "LOST", "EXPIRED"],
  ACCEPTED_NOT_BOOKED: ["BOOKED", "QUOTED_WAITING", "LOST"],
  BOOKED:              [], // No transitions from BOOKED (EventProject manages state)
  LOST:                ["IN_REVIEW"], // Can be reopened
  DISQUALIFIED:        ["IN_REVIEW"], // Can be reopened
  EXPIRED:             ["IN_REVIEW"], // Can be reopened
};

/**
 * Stage order for determining forward vs backward transitions.
 * Higher number = further along in the pipeline.
 */
export const STATUS_STAGE: Partial<Record<InquiryStatus, number>> = {
  NEW: 0,
  IN_REVIEW: 1,
  WAITING_ON_CLIENT: 2,
  QUOTING: 3,
  QUOTED_WAITING: 4,
  ACCEPTED_NOT_BOOKED: 5,
  BOOKED: 6,
};

/** Statuses that close an inquiry negatively — require confirmation. */
export const NEGATIVE_STATUSES: InquiryStatus[] = ["LOST", "DISQUALIFIED", "EXPIRED"];

/** Statuses where the inquiry is considered fully closed/terminal. */
export const TERMINAL_STATUSES: InquiryStatus[] = ["BOOKED", "LOST", "DISQUALIFIED", "EXPIRED"];

/**
 * Asserts that a transition from one status to another is valid.
 * Throws an error if the transition is not allowed.
 */
export function assertInquiryTransition(from: InquiryStatus, to: InquiryStatus): void {
  if (from === to) {
    throw new Error(`Status is already ${from}`);
  }

  const allowed = VALID_TRANSITIONS[from];
  if (!allowed || !allowed.includes(to)) {
    throw new Error(
      `Cannot transition from ${from} to ${to}. Valid transitions: ${allowed?.join(", ") || "none"}`,
    );
  }
}

/**
 * Returns the list of valid next statuses for a given current status.
 */
export function getValidNextStatuses(currentStatus: InquiryStatus): InquiryStatus[] {
  return VALID_TRANSITIONS[currentStatus] ?? [];
}

/**
 * Checks if a transition from one status to another is valid.
 * Returns boolean instead of throwing.
 */
export function canTransitionTo(from: InquiryStatus, to: InquiryStatus): boolean {
  if (from === to) return false;
  const allowed = VALID_TRANSITIONS[from];
  return allowed?.includes(to) ?? false;
}
