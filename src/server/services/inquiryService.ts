import type { InquiryStatus } from "@prisma/client";
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
    const inquiry = await createInquiry(tx, data);

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
