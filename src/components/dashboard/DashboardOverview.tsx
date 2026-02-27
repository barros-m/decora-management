type StatCardProps = {
  title: string;
  value: string;
  note: string;
  tone: "primary" | "warn" | "success" | "muted";
};

function toneStyles(tone: StatCardProps["tone"]) {
  if (tone === "warn") return "border-amber-200 bg-amber-50/90 text-amber-900";
  if (tone === "success")
    return "border-emerald-200 bg-emerald-50/90 text-emerald-900";
  if (tone === "muted") return "border-stone-300 bg-stone-100 text-stone-800";
  return "border-primary/20 bg-primary/10 text-stone-900";
}

function StatCard({ title, value, note, tone }: StatCardProps) {
  return (
    <article className={`rounded-[2rem] border p-5 ${toneStyles(tone)}`}>
      <p className="text-sm font-medium opacity-80">{title}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm opacity-80">{note}</p>
    </article>
  );
}

function SectionPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-primary/15 bg-white/92 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-2xl font-semibold tracking-tight text-stone-900">
          {title}
        </h3>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Coming soon
        </span>
      </div>
      {children}
    </section>
  );
}

export function DashboardOverview({ userName }: { userName: string }) {
  return (
    <>
      <header>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
          <span>Hearts and details</span>
        </div>
        <h1 className="text-4xl font-semibold tracking-tight text-stone-900">
          Welcome back, {userName}
        </h1>
        <p className="mt-1 text-stone-600">
          Here&apos;s what&apos;s blooming today in Florida.
        </p>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Inquiries"
          value="124"
          note="+12% from last month"
          tone="primary"
        />
        <StatCard
          title="Pending Follow-ups"
          value="18"
          note="Action required"
          tone="warn"
        />
        <StatCard
          title="Upcoming Events"
          value="12"
          note="Next: Palm Beach Gala"
          tone="success"
        />
        <StatCard
          title="This Month Booked"
          value="8"
          note="On track for target"
          tone="muted"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <SectionPanel title="Recent Inquiries">
          <div className="space-y-3 rounded-2xl bg-primary/10 p-4 text-sm text-stone-700">
            <p>Sarah Miller - Summer Wedding - New Inquiry</p>
            <p>James Chen - Corporate Retreat - In Progress</p>
            <p>Lila Vaughn - Bridal Shower - Replied</p>
          </div>
        </SectionPanel>

        <SectionPanel title="Upcoming Events">
          <div className="space-y-3 rounded-2xl bg-primary/10 p-4 text-sm text-stone-700">
            <p>Oct 28 - Modern Waterfront Wedding - Miami Beach - 150 Guests</p>
            <p>Nov 04 - Vogue Charity Gala - Palm Beach - 300 Guests</p>
            <p>Nov 12 - Avery&apos;s Sweet 16 - Orlando - 80 Guests</p>
          </div>
        </SectionPanel>
      </div>
    </>
  );
}

