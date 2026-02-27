import { notFound } from "next/navigation";

import { InquiryForm } from "@/src/components/inquiries/InquiryForm";
import { updateInquiryAction } from "@/src/app/(protected)/inquiries/actions";
import { getInquiryByIdService } from "@/src/server/services/inquiryService";

function toDateInputValue(value: Date | null) {
  if (!value) return "";
  const year = value.getUTCFullYear();
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function EditInquiryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await getInquiryByIdService(id);
  if (!inquiry) notFound();

  const updateAction = updateInquiryAction.bind(null, id);

  return (
    <InquiryForm
      title="Edit inquiry"
      description="Update lead details and keep records current."
      submitLabel="Save changes"
      cancelHref={`/inquiries/${id}`}
      action={updateAction}
      values={{
        contactName: inquiry.contactName,
        contactEmail: inquiry.contactEmail,
        contactPhone: inquiry.contactPhone,
        eventType: inquiry.eventType,
        eventDate: toDateInputValue(inquiry.eventDate),
        city: inquiry.city,
        state: inquiry.state,
        address1: inquiry.address1,
        address2: inquiry.address2,
        zipCode: inquiry.zipCode,
        guestCountAdults: inquiry.guestCountAdults,
        guestCountChildren: inquiry.guestCountChildren,
        source: inquiry.source,
        visionNotes: inquiry.visionNotes,
      }}
    />
  );
}

