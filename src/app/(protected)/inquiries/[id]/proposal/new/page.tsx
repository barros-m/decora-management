import { notFound } from "next/navigation";
import Link from "next/link";

import { getInquiryByIdService } from "@/src/server/services/inquiryService";
import { ProposalForm } from "./ProposalForm";

export default async function NewProposalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await getInquiryByIdService(id);
  if (!inquiry) notFound();

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      {/* Nav */}
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <Link href="/inquiries" className="transition hover:text-primary">
          Inquiries
        </Link>
        <span className="text-stone-300">/</span>
        <Link
          href={`/inquiries/${id}`}
          className="transition hover:text-primary"
        >
          {inquiry.contactName}
        </Link>
        <span className="text-stone-300">/</span>
        <span className="text-stone-700">New proposal</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-stone-900">New Proposal</h1>
        <p className="mt-1 text-sm text-stone-500">
          Build the packages and line items for this proposal. It will be saved as a draft.
        </p>
      </div>

      <ProposalForm
        inquiryId={id}
        inquiry={{
          contactName: inquiry.contactName,
          eventType: inquiry.eventType,
          eventDate: inquiry.eventDate,
        }}
      />
    </section>
  );
}
