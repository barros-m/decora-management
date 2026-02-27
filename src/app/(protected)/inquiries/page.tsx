import Link from "next/link";

import { InquiriesTable } from "@/src/components/inquiries/InquiriesTable";
import { listInquiriesService } from "@/src/server/services/inquiryService";

export default async function InquiriesPage() {
  const inquiries = await listInquiriesService();

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
            Inquiries
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Manage incoming leads and follow up quickly.
          </p>
        </div>
        <Link
          href="/inquiries/new"
          className="inline-flex h-11 self-start items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:self-auto"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add inquiry
        </Link>
      </header>

      <InquiriesTable inquiries={inquiries} />
    </section>
  );
}
