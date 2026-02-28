import { prisma } from "@/src/server/db";
import type { ProposalStatus, Prisma } from "@prisma/client";

/* ─── Types ─────────────────────────────────────────────────────────────── */

export type CreateLineItemInput = {
  title: string;
  description?: string;
  quantity: number;
  unitCents: number;
  totalCents: number;
  sortOrder: number;
};

export type CreatePackageInput = {
  name: string;
  description?: string;
  currency?: string;
  items: CreateLineItemInput[];
};

export type CreateProposalInput = {
  inquiryId: string;
  expiresAt?: Date;
  followUpAt?: Date;
  packages: CreatePackageInput[];
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */

async function getNextVersion(
  tx: Prisma.TransactionClient,
  inquiryId: string,
): Promise<number> {
  const last = await tx.proposal.findFirst({
    where: { inquiryId },
    orderBy: { version: "desc" },
    select: { version: true },
  });
  return (last?.version ?? 0) + 1;
}

/* ─── Queries ────────────────────────────────────────────────────────────── */

export async function getProposalsByInquiryId(inquiryId: string) {
  return prisma.proposal.findMany({
    where: { inquiryId },
    include: {
      packages: {
        include: { items: { orderBy: { sortOrder: "asc" } } },
        orderBy: { createdAt: "asc" },
      },
      acceptedPackage: true,
    },
    orderBy: { version: "desc" },
  });
}

export async function getProposalById(id: string) {
  return prisma.proposal.findUnique({
    where: { id },
    include: {
      inquiry: {
        select: {
          id: true,
          contactName: true,
          contactEmail: true,
          contactPhone: true,
          eventType: true,
          eventDate: true,
          city: true,
          state: true,
          visionNotes: true,
        },
      },
      packages: {
        include: { items: { orderBy: { sortOrder: "asc" } } },
        orderBy: { createdAt: "asc" },
      },
      acceptedPackage: true,
    },
  });
}

/* ─── Mutations ──────────────────────────────────────────────────────────── */

export async function createProposal(input: CreateProposalInput) {
  return prisma.$transaction(async (tx) => {
    const version = await getNextVersion(tx, input.inquiryId);

    const proposal = await tx.proposal.create({
      data: {
        inquiryId: input.inquiryId,
        version,
        status: "DRAFT",
        expiresAt: input.expiresAt,
        followUpAt: input.followUpAt,
      },
    });

    for (const pkg of input.packages) {
      const subtotalCents = pkg.items.reduce((s, i) => s + i.totalCents, 0);

      await tx.proposalPackage.create({
        data: {
          proposalId: proposal.id,
          name: pkg.name,
          description: pkg.description,
          currency: pkg.currency ?? "USD",
          subtotalCents,
          items: {
            create: pkg.items.map((item) => ({
              title: item.title,
              description: item.description,
              quantity: item.quantity,
              unitCents: item.unitCents,
              totalCents: item.totalCents,
              sortOrder: item.sortOrder,
            })),
          },
        },
      });
    }

    return tx.proposal.findUniqueOrThrow({
      where: { id: proposal.id },
      include: {
        packages: {
          include: { items: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
  });
}

export async function updateProposalStatus(
  id: string,
  status: ProposalStatus,
  extra?: { sentAt?: Date; expiresAt?: Date },
) {
  return prisma.proposal.update({
    where: { id },
    data: { status, ...extra },
  });
}

export async function setAcceptedPackage(
  proposalId: string,
  packageId: string,
) {
  return prisma.proposal.update({
    where: { id: proposalId },
    data: { acceptedPackageId: packageId, status: "ACCEPTED" },
  });
}
