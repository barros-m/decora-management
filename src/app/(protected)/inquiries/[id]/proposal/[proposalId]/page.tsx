import { notFound } from "next/navigation";
import Link from "next/link";

import { getProposalByIdService } from "@/src/server/services/proposalService";
import { ProposalStatusBadge } from "@/src/components/proposals/ProposalStatusBadge";

function formatDate(value: Date | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(value);
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default async function ProposalDetailPage({
  params,
}: {
  params: Promise<{ id: string; proposalId: string }>;
}) {
  const { id, proposalId } = await params;
  const proposal = await getProposalByIdService(proposalId);
  if (!proposal || proposal.inquiryId !== id) notFound();

  const inquiry = proposal.inquiry;
  const grandTotal = proposal.packages.reduce(
    (s, pkg) => s + pkg.subtotalCents,
    0,
  );
  const deposit = Math.ceil(grandTotal / 2);

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-500">
        <Link href="/inquiries" className="transition hover:text-primary">
          Inquiries
        </Link>
        <span className="text-stone-300">/</span>
        <Link href={`/inquiries/${id}`} className="transition hover:text-primary">
          {inquiry.contactName}
        </Link>
        <span className="text-stone-300">/</span>
        <span className="text-stone-700">Proposal v{proposal.version}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-stone-900">
              Proposal v{proposal.version}
            </h1>
            <ProposalStatusBadge status={proposal.status} />
          </div>
          <p className="mt-1 text-sm text-stone-500">
            Issued {formatDate(proposal.createdAt)}
            {proposal.expiresAt && ` · Expires ${formatDate(proposal.expiresAt)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Future: PDF export button */}
          <span className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs text-stone-400">
            PDF export coming soon
          </span>
        </div>
      </div>

      {/* Event details */}
      <div className="rounded-[2rem] border border-primary/15 bg-white/95 p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-primary">
          Event Details
        </h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-stone-400">Client</p>
            <p className="text-sm font-semibold text-stone-800">{inquiry.contactName}</p>
            <p className="text-xs text-stone-500">{inquiry.contactEmail}</p>
          </div>
          <div>
            <p className="text-xs text-stone-400">Event type</p>
            <p className="text-sm font-semibold text-stone-800">{inquiry.eventType}</p>
          </div>
          {inquiry.eventDate && (
            <div>
              <p className="text-xs text-stone-400">Date</p>
              <p className="text-sm font-semibold text-stone-800">{formatDate(inquiry.eventDate)}</p>
            </div>
          )}
          {inquiry.city && (
            <div>
              <p className="text-xs text-stone-400">Location</p>
              <p className="text-sm font-semibold text-stone-800">
                {[inquiry.city, inquiry.state].filter(Boolean).join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Packages */}
      {proposal.packages.map((pkg, pkgIdx) => (
        <div
          key={pkg.id}
          className="rounded-[2rem] border border-primary/15 bg-white/95 p-6"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-stone-900">{pkg.name}</h2>
              {pkg.description && (
                <p className="mt-0.5 text-sm text-stone-500">{pkg.description}</p>
              )}
            </div>
            <span className="text-xs text-stone-400">Package {pkgIdx + 1}</span>
          </div>

          {/* Line items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="pb-2 text-left text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    Item
                  </th>
                  <th className="pb-2 text-center text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    Qty
                  </th>
                  <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    Unit
                  </th>
                  <th className="pb-2 text-right text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {pkg.items.map((item, itemIdx) => (
                  <tr key={item.id} className="py-2">
                    <td className="py-2.5 pr-4">
                      <p className="font-medium text-stone-800">{item.title}</p>
                      {item.description && (
                        <p className="text-xs text-stone-400">{item.description}</p>
                      )}
                    </td>
                    <td className="py-2.5 text-center text-stone-500">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 text-right text-stone-600">
                      {formatCents(item.unitCents)}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-stone-800">
                      {formatCents(item.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-stone-200">
                  <td colSpan={3} className="pt-3 text-right text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Package subtotal
                  </td>
                  <td className="pt-3 text-right text-base font-bold text-stone-900">
                    {formatCents(pkg.subtotalCents)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ))}

      {/* Investment summary */}
      <div className="rounded-[2rem] border border-primary/15 bg-white/95 p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-primary">
          Investment Summary
        </h2>
        <div className="space-y-2">
          {proposal.packages.map((pkg) => (
            <div key={pkg.id} className="flex items-center justify-between">
              <span className="text-sm text-stone-600">{pkg.name}</span>
              <span className="text-sm font-semibold text-stone-800">
                {formatCents(pkg.subtotalCents)}
              </span>
            </div>
          ))}
          <div className="border-t border-stone-200 pt-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-800">Total</span>
              <span className="text-xl font-bold text-stone-900">
                {formatCents(grandTotal)}
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="text-stone-400">50% deposit to confirm</span>
              <span className="font-medium text-stone-600">{formatCents(deposit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms */}
      <div className="rounded-[2rem] border border-stone-200 bg-stone-50 p-5 text-sm text-stone-500">
        <ul className="space-y-1">
          <li>· Confirmation requires 50% deposit of the total value.</li>
          <li>· This proposal is valid for 30 days from the date of issue.</li>
          {inquiry.eventDate && (
            <li>· Event scheduled for {formatDate(inquiry.eventDate)}.</li>
          )}
        </ul>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between pb-6">
        <Link
          href={`/inquiries/${id}`}
          className="text-sm text-stone-400 transition hover:text-stone-700"
        >
          ← Back to inquiry
        </Link>
        <Link
          href={`/inquiries/${id}/proposal/new`}
          className="inline-flex h-9 items-center justify-center rounded-full border border-stone-200 bg-white px-5 text-sm font-medium text-stone-600 transition hover:border-primary/30 hover:text-primary"
        >
          New proposal version
        </Link>
      </div>
    </section>
  );
}
