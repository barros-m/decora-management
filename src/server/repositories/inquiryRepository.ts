import type { InquiryStatus, Prisma } from "@prisma/client";

type DbClient = Prisma.TransactionClient;

export type InquiryListItem = {
  id: string;
  contactName: string;
  contactEmail: string;
  eventType: string;
  eventDate: Date | null;
  status: InquiryStatus;
  createdAt: Date;
};

export type InquiryDetails = {
  id: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  eventType: string;
  eventDate: Date | null;
  status: InquiryStatus;
  city: string | null;
  state: string | null;
  address1: string | null;
  address2: string | null;
  zipCode: string | null;
  guestCountAdults: number | null;
  guestCountChildren: number | null;
  visionNotes: string | null;
  source: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UpsertInquiryInput = {
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string | null;
  eventType?: string;
  eventDate?: Date | null;
  city?: string | null;
  state?: string | null;
  address1?: string | null;
  address2?: string | null;
  zipCode?: string | null;
  guestCountAdults?: number | null;
  guestCountChildren?: number | null;
  visionNotes?: string | null;
  source?: string | null;
  status?: InquiryStatus;
  assignedToId?: string | null;
};

export async function listInquiries(db: DbClient): Promise<InquiryListItem[]> {
  return db.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      contactName: true,
      contactEmail: true,
      eventType: true,
      eventDate: true,
      status: true,
      createdAt: true,
    },
  });
}

export async function getInquiryById(
  db: DbClient,
  inquiryId: string,
): Promise<InquiryDetails | null> {
  return db.inquiry.findUnique({
    where: { id: inquiryId },
    select: {
      id: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      eventType: true,
      eventDate: true,
      status: true,
      city: true,
      state: true,
      address1: true,
      address2: true,
      zipCode: true,
      guestCountAdults: true,
      guestCountChildren: true,
      visionNotes: true,
      source: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function createInquiry(
  db: DbClient,
  data: Omit<UpsertInquiryInput, "status" | "assignedToId"> & {
    contactName: string;
    contactEmail: string;
    eventType: string;
  },
): Promise<{ id: string }> {
  return db.inquiry.create({
    data: {
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone ?? null,
      eventType: data.eventType,
      eventDate: data.eventDate ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      address1: data.address1 ?? null,
      address2: data.address2 ?? null,
      zipCode: data.zipCode ?? null,
      guestCountAdults: data.guestCountAdults ?? null,
      guestCountChildren: data.guestCountChildren ?? null,
      visionNotes: data.visionNotes ?? null,
      source: data.source ?? null,
    },
    select: { id: true },
  });
}

export async function updateInquiry(
  db: DbClient,
  inquiryId: string,
  data: UpsertInquiryInput,
): Promise<{ id: string } | null> {
  const existing = await db.inquiry.findUnique({
    where: { id: inquiryId },
    select: { id: true },
  });

  if (!existing) return null;

  const updateData: Prisma.InquiryUpdateInput = {};

  if (data.contactName !== undefined) updateData.contactName = data.contactName;
  if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail;
  if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
  if (data.eventType !== undefined) updateData.eventType = data.eventType;
  if (data.eventDate !== undefined) updateData.eventDate = data.eventDate;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.address1 !== undefined) updateData.address1 = data.address1;
  if (data.address2 !== undefined) updateData.address2 = data.address2;
  if (data.zipCode !== undefined) updateData.zipCode = data.zipCode;
  if (data.guestCountAdults !== undefined) updateData.guestCountAdults = data.guestCountAdults;
  if (data.guestCountChildren !== undefined) updateData.guestCountChildren = data.guestCountChildren;
  if (data.visionNotes !== undefined) updateData.visionNotes = data.visionNotes;
  if (data.source !== undefined) updateData.source = data.source;

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.assignedToId !== undefined) {
    if (data.assignedToId === null) {
      updateData.assignedTo = { disconnect: true };
    } else {
      updateData.assignedTo = { connect: { id: data.assignedToId } };
    }
  }

  return db.inquiry.update({
    where: { id: inquiryId },
    data: updateData,
    select: { id: true },
  });
}

export async function createInquiryActivityLog(
  db: DbClient,
  input: {
    inquiryId: string;
    actorId?: string | null;
    type: string;
    message: string;
    data?: Prisma.InputJsonValue;
  },
) {
  return db.activityLog.create({
    data: {
      inquiryId: input.inquiryId,
      actorId: input.actorId ?? null,
      type: input.type,
      message: input.message,
      ...(input.data ? { data: input.data } : {}),
    },
    select: { id: true },
  });
}
