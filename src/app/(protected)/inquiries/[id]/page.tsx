import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InquiryStatusBadge } from "@/src/components/inquiries/InquiryStatusBadge";
import { getInquiryByIdService } from "@/src/server/services/inquiryService";

function formatDate(value: Date | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(value);
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-stone-100 py-3 last:border-0">
      <dt className="shrink-0 text-sm text-stone-400">{label}</dt>
      <dd className="text-right text-sm font-medium text-stone-800">{value}</dd>
    </div>
  );
}

export default async function InquiryDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await getInquiryByIdService(id);
  if (!inquiry) notFound();

  const fullAddress = [inquiry.address1, inquiry.address2]
    .filter(Boolean)
    .join(", ");
  const cityStateZip = [inquiry.city, inquiry.state, inquiry.zipCode]
    .filter(Boolean)
    .join(", ");

  return (
    <section className="mx-auto w-full max-w-4xl space-y-5">
      {/* Navigation row */}
      <div className="flex items-center justify-between">
        <Link
          href="/inquiries"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-stone-500 transition hover:text-primary"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Inquiries
        </Link>
        <Link
          href={`/inquiries/${inquiry.id}/edit`}
          className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
        >
          Edit inquiry
        </Link>
      </div>

      {/* Header card */}
      <div className="flex flex-col gap-4 rounded-[2rem] border border-primary/15 bg-white/95 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
            {initials(inquiry.contactName)}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-stone-900">
              {inquiry.contactName}
            </h1>
            <p className="text-sm text-stone-500">{inquiry.contactEmail}</p>
            {inquiry.contactPhone && (
              <p className="text-sm text-stone-400">{inquiry.contactPhone}</p>
            )}
          </div>
        </div>
        <InquiryStatusBadge status={inquiry.status} />
      </div>

      {/* Detail cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Event */}
        <article className="rounded-[2rem] border border-primary/15 bg-white/95 px-6 pb-2 pt-5">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Event
          </h2>
          <dl>
            <DetailRow label="Type" value={inquiry.eventType} />
            <DetailRow label="Date" value={formatDate(inquiry.eventDate)} />
            <DetailRow label="Source" value={inquiry.source || "—"} />
          </dl>
        </article>

        {/* Location & guests */}
        <article className="rounded-[2rem] border border-primary/15 bg-white/95 px-6 pb-2 pt-5">
          <h2 className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Location & guests
          </h2>
          <dl>
            {fullAddress && (
              <DetailRow label="Address" value={fullAddress} />
            )}
            {cityStateZip && (
              <DetailRow label="City / State / Zip" value={cityStateZip} />
            )}
            <DetailRow
              label="Guests"
              value={
                inquiry.guestCountAdults != null ||
                inquiry.guestCountChildren != null
                  ? `${inquiry.guestCountAdults ?? 0} adults · ${inquiry.guestCountChildren ?? 0} children`
                  : "—"
              }
            />
          </dl>
        </article>
      </div>

      {/* Vision notes */}
      <article className="rounded-[2rem] border border-primary/15 bg-white/95 p-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-primary">
          Vision notes
        </h2>
        {inquiry.visionNotes ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
            {inquiry.visionNotes}
          </p>
        ) : (
          <p className="text-sm italic text-stone-300">
            No vision notes provided yet.
          </p>
        )}
      </article>

      {/* Meta */}
      <p className="px-2 text-xs text-stone-400">
        Created {formatDateTime(inquiry.createdAt)} · Updated{" "}
        {formatDateTime(inquiry.updatedAt)}
      </p>
    </section>
  );
}
