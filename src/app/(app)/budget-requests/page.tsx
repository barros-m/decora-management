export default function BudgetRequestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Budget Requests
          </h1>
          <p className="mt-1 text-sm text-zinc-600">
            Review and approve budget allocations for upcoming event contracts.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center rounded-xl bg-emerald-900 px-4 py-2 text-sm font-semibold text-white shadow-sm opacity-60"
          disabled
        >
          + New Request
        </button>
      </div>

      <div className="rounded-3xl border border-zinc-200 bg-white p-10 text-center">
        <p className="text-sm font-medium text-zinc-900">Coming soon</p>
        <p className="mt-2 text-sm text-zinc-600">
          This section is under construction.
        </p>
      </div>
    </div>
  );
}

