import {
  createProposal,
  getProposalsByInquiryId,
  getProposalById,
  updateProposalStatus,
  type CreateProposalInput,
} from "@/src/server/repositories/proposalRepository";
import { prisma } from "@/src/server/db";

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/* ─── Queries ────────────────────────────────────────────────────────────── */

export async function getProposalsByInquiryService(inquiryId: string) {
  return getProposalsByInquiryId(inquiryId);
}

export async function getProposalByIdService(id: string) {
  return getProposalById(id);
}

/* ─── Mutations ──────────────────────────────────────────────────────────── */

export type CreateProposalServiceInput = {
  inquiryId: string;
  packages: CreateProposalInput["packages"];
  expiresInDays?: number; // default 30
  actorId?: string;
};

export async function createProposalService({
  inquiryId,
  packages,
  expiresInDays = 30,
  actorId,
}: CreateProposalServiceInput) {
  if (!packages || packages.length === 0) {
    throw new Error("A proposal must have at least one package.");
  }

  for (const pkg of packages) {
    if (!pkg.name?.trim()) {
      throw new Error("Each package must have a name.");
    }
    if (!pkg.items || pkg.items.length === 0) {
      throw new Error(`Package "${pkg.name}" must have at least one item.`);
    }
  }

  const expiresAt = addDays(new Date(), expiresInDays);

  const proposal = await createProposal({ inquiryId, packages, expiresAt });

  // Log activity
  await prisma.activityLog.create({
    data: {
      inquiryId,
      proposalId: proposal.id,
      actorId: actorId ?? null,
      type: "PROPOSAL_CREATED",
      message: `Proposal v${proposal.version} created as draft.`,
    },
  });

  return proposal;
}

export async function markProposalAsSentService(
  proposalId: string,
  actorId?: string,
) {
  const proposal = await getProposalById(proposalId);
  if (!proposal) throw new Error("Proposal not found.");

  const now = new Date();
  const updated = await updateProposalStatus(proposalId, "SENT", {
    sentAt: now,
  });

  await prisma.activityLog.create({
    data: {
      inquiryId: proposal.inquiryId,
      proposalId,
      actorId: actorId ?? null,
      type: "PROPOSAL_SENT",
      message: `Proposal v${proposal.version} marked as sent.`,
    },
  });

  return updated;
}
