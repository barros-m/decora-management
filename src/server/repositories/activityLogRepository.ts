import type { Prisma } from "@prisma/client";

type DbClient = Prisma.TransactionClient;

export type ActivityLogItem = {
  id: string;
  type: string;
  message: string | null;
  data: Prisma.JsonValue;
  createdAt: Date;
  actor: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

/**
 * Get activity logs for an inquiry, ordered by most recent first
 */
export async function getInquiryActivityLogs(
  db: DbClient,
  inquiryId: string,
): Promise<ActivityLogItem[]> {
  return db.activityLog.findMany({
    where: { inquiryId },
    select: {
      id: true,
      type: true,
      message: true,
      data: true,
      createdAt: true,
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get activity logs for a proposal
 */
export async function getProposalActivityLogs(
  db: DbClient,
  proposalId: string,
): Promise<ActivityLogItem[]> {
  return db.activityLog.findMany({
    where: { proposalId },
    select: {
      id: true,
      type: true,
      message: true,
      data: true,
      createdAt: true,
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get activity logs for an event
 */
export async function getEventActivityLogs(
  db: DbClient,
  eventId: string,
): Promise<ActivityLogItem[]> {
  return db.activityLog.findMany({
    where: { eventId },
    select: {
      id: true,
      type: true,
      message: true,
      data: true,
      createdAt: true,
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get activity logs for a booking
 */
export async function getBookingActivityLogs(
  db: DbClient,
  bookingId: string,
): Promise<ActivityLogItem[]> {
  return db.activityLog.findMany({
    where: { bookingId },
    select: {
      id: true,
      type: true,
      message: true,
      data: true,
      createdAt: true,
      actor: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
