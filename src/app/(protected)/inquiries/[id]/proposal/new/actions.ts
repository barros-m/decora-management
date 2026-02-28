"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireSessionUser } from "@/src/server/requireSessionUser";
import { createProposalService } from "@/src/server/services/proposalService";

const lineItemSchema = z.object({
  title: z.string().min(1, "Item title is required"),
  description: z.string().optional(),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  unitCents: z.number().int().min(0, "Price cannot be negative"),
});

const packageSchema = z.object({
  name: z.string().min(1, "Package name is required"),
  description: z.string().optional(),
  items: z.array(lineItemSchema).min(1, "Each package needs at least one item"),
});

const createProposalSchema = z.object({
  inquiryId: z.string().min(1),
  packages: z.array(packageSchema).min(1, "Add at least one package"),
  expiresInDays: z.number().int().min(1).max(365).default(30),
});

export type CreateProposalFormState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createProposalAction(
  _prev: CreateProposalFormState,
  formData: FormData,
): Promise<CreateProposalFormState> {
  try {
    const user = await requireSessionUser();

    const raw = formData.get("payload");
    if (!raw || typeof raw !== "string") {
      return { error: "Invalid form data" };
    }

    const parsed = createProposalSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return {
        error: "Validation failed",
        fieldErrors: parsed.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
      };
    }

    const { inquiryId, packages, expiresInDays } = parsed.data;

    // Compute totalCents for each item
    const packagesWithTotals = packages.map((pkg) => ({
      ...pkg,
      items: pkg.items.map((item, idx) => ({
        ...item,
        totalCents: item.quantity * item.unitCents,
        sortOrder: idx,
      })),
    }));

    const proposal = await createProposalService({
      inquiryId,
      packages: packagesWithTotals,
      expiresInDays,
      actorId: user.id,
    });

    revalidatePath(`/inquiries/${inquiryId}`);
    revalidatePath("/inquiries");

    redirect(`/inquiries/${inquiryId}/proposal/${proposal.id}`);
  } catch (error) {
    // redirect() throws internally — rethrow it
    if (
      error instanceof Error &&
      error.message === "NEXT_REDIRECT"
    ) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    return { error: message };
  }
}
