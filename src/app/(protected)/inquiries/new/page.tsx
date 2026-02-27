import { InquiryForm } from "@/src/components/inquiries/InquiryForm";
import { createInquiryAction } from "@/src/app/(protected)/inquiries/actions";

export default function NewInquiryPage() {
  return (
    <InquiryForm
      title="Add inquiry"
      description="Create a new lead entry with client and event details."
      submitLabel="Create inquiry"
      cancelHref="/inquiries"
      action={createInquiryAction}
    />
  );
}

