"use server";

import { revalidatePath } from "next/cache";
import type { InquiryStatus } from "@prisma/client";
import { z } from "zod";

import { requireSessionUser } from "@/src/server/requireSessionUser";
import {
  updateInquiryStatusService,
  assignInquiryService,
  requestMoreInfoService,
} from "@/src/server/services/inquiryService";

// Validation schemas
const updateStatusSchema = z.object({
  inquiryId: z.string().min(1),
  newStatus: z.enum([
    "NEW",
    "IN_REVIEW",
    "WAITING_ON_CLIENT",
    "QUOTING",
    "QUOTED_WAITING",
    "ACCEPTED_NOT_BOOKED",
    "BOOKED",
    "LOST",
    "DISQUALIFIED",
    "EXPIRED",
  ] as const),
  message: z.string().optional(),
});

const assignSchema = z.object({
  inquiryId: z.string().min(1),
  userId: z.string().min(1),
});

const requestInfoSchema = z.object({
  inquiryId: z.string().min(1),
  message: z.string().min(1),
});

/**
 * Server action to update inquiry status
 */
export async function updateInquiryStatusAction(
  input: z.infer<typeof updateStatusSchema>,
) {
  try {
    const user = await requireSessionUser();
    const parsed = updateStatusSchema.parse(input);

    const updated = await updateInquiryStatusService(
      parsed.inquiryId,
      parsed.newStatus as InquiryStatus,
      {
        message: parsed.message,
        actorId: user.id,
      },
    );

    if (!updated) {
      return { error: "Inquiry not found" };
    }

    revalidatePath(`/inquiries/${parsed.inquiryId}`);
    revalidatePath("/inquiries");

    return { success: true, inquiry: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: message };
  }
}

/**
 * Server action to assign inquiry to a user
 */
export async function assignInquiryAction(
  input: z.infer<typeof assignSchema>,
) {
  try {
    const user = await requireSessionUser();
    const parsed = assignSchema.parse(input);

    const updated = await assignInquiryService(
      parsed.inquiryId,
      parsed.userId,
      user.id,
    );

    if (!updated) {
      return { error: "Inquiry not found" };
    }

    revalidatePath(`/inquiries/${parsed.inquiryId}`);
    revalidatePath("/inquiries");

    return { success: true, inquiry: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: message };
  }
}

/**
 * Server action to request more information from client
 */
export async function requestMoreInfoAction(
  input: z.infer<typeof requestInfoSchema>,
) {
  try {
    const user = await requireSessionUser();
    const parsed = requestInfoSchema.parse(input);

    const updated = await requestMoreInfoService(
      parsed.inquiryId,
      parsed.message,
      user.id,
    );

    if (!updated) {
      return { error: "Inquiry not found" };
    }

    revalidatePath(`/inquiries/${parsed.inquiryId}`);
    revalidatePath("/inquiries");

    return { success: true, inquiry: updated };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: message };
  }
}
