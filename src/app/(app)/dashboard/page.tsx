export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Welcome to the DeCora Florida management portal.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium text-zinc-500">Budget Requests</p>
          <p className="mt-2 text-lg font-semibold text-zinc-900">Coming soon</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium text-zinc-500">Events</p>
          <p className="mt-2 text-lg font-semibold text-zinc-900">Coming soon</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-xs font-medium text-zinc-500">Clients</p>
          <p className="mt-2 text-lg font-semibold text-zinc-900">Coming soon</p>
        </div>
      </div>
    </div>
  );
}

