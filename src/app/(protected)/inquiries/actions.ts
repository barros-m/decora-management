"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  createInquiryService,
  updateInquiryService,
} from "@/src/server/services/inquiryService";
import { requireSessionUser } from "@/src/server/requireSessionUser";

const optionalString = z.preprocess((value) => {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length === 0 ? null : normalized;
}, z.string().nullable());

const optionalDate = z.preprocess((value) => {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}, z.date().nullable());

const optionalNumber = z.preprocess((value) => {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed;
}, z.number().int().min(0).nullable());

const inquiryFormSchema = z.object({
  contactName: z.string().trim().min(1),
  contactEmail: z.string().trim().toLowerCase().email(),
  contactPhone: optionalString,
  eventType: z.string().trim().min(1),
  eventDate: optionalDate,
  city: optionalString,
  state: optionalString,
  address1: optionalString,
  address2: optionalString,
  zipCode: optionalString,
  guestCountAdults: optionalNumber,
  guestCountChildren: optionalNumber,
  source: optionalString,
  visionNotes: optionalString,
});

function parseInquiryFormData(formData: FormData) {
  return inquiryFormSchema.parse({
    contactName: formData.get("contactName"),
    contactEmail: formData.get("contactEmail"),
    contactPhone: formData.get("contactPhone"),
    eventType: formData.get("eventType"),
    eventDate: formData.get("eventDate"),
    city: formData.get("city"),
    state: formData.get("state"),
    address1: formData.get("address1"),
    address2: formData.get("address2"),
    zipCode: formData.get("zipCode"),
    guestCountAdults: formData.get("guestCountAdults"),
    guestCountChildren: formData.get("guestCountChildren"),
    source: formData.get("source"),
    visionNotes: formData.get("visionNotes"),
  });
}

export async function createInquiryAction(formData: FormData) {
  const user = await requireSessionUser();
  const payload = parseInquiryFormData(formData);

  const inquiry = await createInquiryService(payload, user.id);
  revalidatePath("/inquiries");
  redirect(`/inquiries/${inquiry.id}`);
}

export async function updateInquiryAction(inquiryId: string, formData: FormData) {
  const user = await requireSessionUser();
  const payload = parseInquiryFormData(formData);

  const updated = await updateInquiryService(inquiryId, payload, user.id);
  if (!updated) redirect("/inquiries");

  revalidatePath("/inquiries");
  revalidatePath(`/inquiries/${inquiryId}`);
  redirect(`/inquiries/${inquiryId}`);
}

