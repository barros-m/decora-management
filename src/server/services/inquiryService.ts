import type { InquiryStatus, Prisma } from "@prisma/client";
import { z } from "zod";

import { prisma } from "@/src/server/db";
import {
  createInquiry,
  createInquiryActivityLog,
  getInquiryById,
  listInquiries,
  updateInquiry,
  type InquiryDetails,
  type InquiryListItem,
  type UpsertInquiryInput,
} from "@/src/server/repositories/inquiryRepository";
import { assertInquiryTransition, getValidNextStatuses } from "@/src/server/services/inquiryStateValidator";
import { getInquiryActivityLogs, type ActivityLogItem } from "@/src/server/repositories/activityLogRepository";

const inquiryInputSchema = z.object({
  contactName: z.string().trim().min(1),
  contactEmail: z.string().trim().toLowerCase().email(),
  contactPhone: z.string().trim().optional().nullable(),
  eventType: z.string().trim().min(1),
  eventDate: z.date().optional().nullable(),
  city: z.string().trim().optional().nullable(),
  state: z.string().trim().optional().nullable(),
  address1: z.string().trim().optional().nullable(),
  address2: z.string().trim().optional().nullable(),
  zipCode: z.string().trim().optional().nullable(),
  guestCountAdults: z.number().int().min(0).optional().nullable(),
  guestCountChildren: z.number().int().min(0).optional().nullable(),
  visionNotes: z.string().trim().optional().nullable(),
  source: z.string().trim().optional().nullable(),
});

function normalizeNullable(value: string | null | undefined) {
  if (!value) return null;
  return value.trim() || null;
}

function toRepositoryInput(input: z.infer<typeof inquiryInputSchema>): UpsertInquiryInput {
  return {
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    contactPhone: normalizeNullable(input.contactPhone),
    eventType: input.eventType,
    eventDate: input.eventDate ?? null,
    city: normalizeNullable(input.city),
    state: normalizeNullable(input.state),
    address1: normalizeNullable(input.address1),
    address2: normalizeNullable(input.address2),
    zipCode: normalizeNullable(input.zipCode),
    guestCountAdults: input.guestCountAdults ?? null,
    guestCountChildren: input.guestCountChildren ?? null,
    visionNotes: normalizeNullable(input.visionNotes),
    source: normalizeNullable(input.source),
  };
}

export async function listInquiriesService(): Promise<InquiryListItem[]> {
  return prisma.$transaction((tx) => listInquiries(tx));
}

export async function getInquiryByIdService(
  inquiryId: string,
): Promise<InquiryDetails | null> {
  return prisma.$transaction((tx) => getInquiryById(tx, inquiryId));
}

export async function createInquiryService(
  input: z.infer<typeof inquiryInputSchema>,
  actorId?: string | null,
): Promise<{ id: string }> {
  const parsed = inquiryInputSchema.parse(input);
  const data = toRepositoryInput(parsed);

  return prisma.$transaction(async (tx) => {
    const inquiry = await createInquiry(tx, data as any);

    await createInquiryActivityLog(tx, {
      inquiryId: inquiry.id,
      actorId,
      type: "INQUIRY_CREATED",
      message: "Inquiry created from management app.",
      data: {
        contactEmail: parsed.contactEmail,
      },
    });

    return inquiry;
  });
}

export async function updateInquiryService(
  inquiryId: string,
  input: z.infer<typeof inquiryInputSchema>,
  actorId?: string | null,
): Promise<{ id: string } | null> {
  const parsed = inquiryInputSchema.parse(input);
  const data = toRepositoryInput(parsed);

  return prisma.$transaction(async (tx) => {
    const inquiry = await updateInquiry(tx, inquiryId, data);
    if (!inquiry) return null;

    await createInquiryActivityLog(tx, {
      inquiryId,
      actorId,
      type: "INQUIRY_UPDATED",
      message: "Inquiry details updated from management app.",
    });

    return inquiry;
  });
}

export function getInquiryStatusLabel(status: InquiryStatus): string {
  return status.replaceAll("_", " ");
}

/**
 * Update inquiry status with state machine validation.
 * Only allows valid status transitions.
 */
export async function updateInquiryStatusService(
  inquiryId: string,
  newStatus: InquiryStatus,
  options?: {
    message?: string;
    data?: Prisma.InputJsonValue;
    actorId?: string | null;
  },
): Promise<InquiryDetails | null> {
  return prisma.$transaction(async (tx) => {
    // Get current inquiry
    const inquiry = await getInquiryById(tx, inquiryId);
    if (!inquiry) return null;

    // Validate state transition
    assertInquiryTransition(inquiry.status, newStatus);

    // Update status
    const updated = await updateInquiry(tx, inquiryId, { status: newStatus });
    if (!updated) return null;

    // Log the transition
    await createInquiryActivityLog(tx, {
      inquiryId,
      actorId: options?.actorId ?? null,
      type: "INQUIRY_STATUS_CHANGED",
      message: options?.message ?? `Status changed to ${getInquiryStatusLabel(newStatus)}`,
      data: options?.data,
    });

    return getInquiryById(tx, inquiryId);
  });
}

/**
 * Assign an inquiry to a user.
 */
export async function assignInquiryService(
  inquiryId: string,
  userId: string,
  actorId?: string | null,
): Promise<InquiryDetails | null> {
  return prisma.$transaction(async (tx) => {
    const inquiry = await getInquiryById(tx, inquiryId);
    if (!inquiry) return null;

    // Update assigned user
    const updated = await updateInquiry(tx, inquiryId, { assignedToId: userId });
    if (!updated) return null;

    // Log the assignment
    await createInquiryActivityLog(tx, {
      inquiryId,
      actorId,
      type: "INQUIRY_ASSIGNED",
      message: `Inquiry assigned to user ${userId}`,
      data: { assignedToId: userId },
    });

    return getInquiryById(tx, inquiryId);
  });
}

/**
 * Request more information from client.
 * Transitions to WAITING_ON_CLIENT status.
 */
export async function requestMoreInfoService(
  inquiryId: string,
  message: string,
  actorId?: string | null,
): Promise<InquiryDetails | null> {
  return updateInquiryStatusService(inquiryId, "WAITING_ON_CLIENT", {
    message: `Requested more info: ${message}`,
    data: { originalMessage: message },
    actorId,
  });
}

/**
 * Get the valid next statuses for an inquiry.
 */
export async function getValidInquiryTransitionsService(
  inquiryId: string,
): Promise<InquiryStatus[] | null> {
  const inquiry = await getInquiryByIdService(inquiryId);
  if (!inquiry) return null;
  return getValidNextStatuses(inquiry.status);
}

/**
 * Get activity logs for an inquiry.
 */
export async function getInquiryActivityService(
  inquiryId: string,
): Promise<ActivityLogItem[]> {
  return prisma.$transaction((tx) => getInquiryActivityLogs(tx, inquiryId));
}
