import Link from "next/link";

export type InquiryFormValues = {
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  eventType?: string | null;
  eventDate?: string | null;
  city?: string | null;
  state?: string | null;
  address1?: string | null;
  address2?: string | null;
  zipCode?: string | null;
  guestCountAdults?: number | null;
  guestCountChildren?: number | null;
  source?: string | null;
  visionNotes?: string | null;
};

type InquiryFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  cancelHref: string;
  action: (formData: FormData) => void | Promise<void>;
  values?: InquiryFormValues;
};

const INPUT_CLASS =
  "h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-300 focus:border-primary/40 focus:ring-4 focus:ring-primary/15";

const LABEL_CLASS = "flex flex-col gap-1.5 text-sm font-medium text-stone-700";

const SECTION_CLASS =
  "overflow-hidden rounded-[2rem] border border-primary/15 bg-white/95";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-b border-primary/10 bg-primary-soft px-6 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        {children}
      </p>
    </div>
  );
}

function Required() {
  return <span className="text-primary">*</span>;
}

export function InquiryForm({
  title,
  description,
  submitLabel,
  cancelHref,
  action,
  values,
}: InquiryFormProps) {
  return (
    <section className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-stone-900">
          {title}
        </h1>
        <p className="mt-1.5 text-sm text-stone-500">{description}</p>
      </div>

      <form action={action} className="space-y-4">
        {/* Contact */}
        <div className={SECTION_CLASS}>
          <SectionHeader>Contact</SectionHeader>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            <label className={LABEL_CLASS}>
              <span>
                Name <Required />
              </span>
              <input
                name="contactName"
                defaultValue={values?.contactName ?? ""}
                required
                placeholder="Jane Doe"
                className={INPUT_CLASS}
              />
            </label>

            <label className={LABEL_CLASS}>
              <span>
                Email <Required />
              </span>
              <input
                name="contactEmail"
                type="email"
                defaultValue={values?.contactEmail ?? ""}
                required
                placeholder="jane@example.com"
                className={INPUT_CLASS}
              />
            </label>

            <label className={LABEL_CLASS}>
              <span>Phone</span>
              <input
                name="contactPhone"
                defaultValue={values?.contactPhone ?? ""}
                placeholder="(555) 000-0000"
                className={INPUT_CLASS}
              />
            </label>
          </div>
        </div>

        {/* Event */}
        <div className={SECTION_CLASS}>
          <SectionHeader>Event</SectionHeader>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            <label className={LABEL_CLASS}>
              <span>
                Event type <Required />
              </span>
              <input
                name="eventType"
                defaultValue={values?.eventType ?? ""}
                required
                placeholder="Wedding, Quinceañera…"
                className={INPUT_CLASS}
              />
            </label>

            <label className={LABEL_CLASS}>
              <span>Event date</span>
              <input
                name="eventDate"
                type="date"
                defaultValue={values?.eventDate ?? ""}
                className={INPUT_CLASS}
              />
            </label>

            <label className={LABEL_CLASS}>
              <span>Source</span>
              <input
                name="source"
                defaultValue={values?.source ?? ""}
                placeholder="Instagram, Referral…"
                className={INPUT_CLASS}
              />
            </label>
          </div>
        </div>

        {/* Location */}
        <div className={SECTION_CLASS}>
          <SectionHeader>Location</SectionHeader>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            <label className={`${LABEL_CLASS} md:col-span-2`}>
              <span>Address line 1</span>
              <input
                name="address1"
                defaultValue={values?.address1 ?? ""}
                placeholder="123 Main St"
                className={INPUT_CLASS}
              />
            </label>

            <label className={`${LABEL_CLASS} md:col-span-2`}>
              <span>Address line 2</span>
              <input
                name="address2"
                defaultValue={values?.address2 ?? ""}
                placeholder="Apt, suite, unit…"
                className={INPUT_CLASS}
              />
            </label>

            <label className={LABEL_CLASS}>
              <span>City</span>
              <input
                name="city"
                defaultValue={values?.city ?? ""}
                placeholder="Miami"
                className={INPUT_CLASS}
              />
            </label>

            <label className={LABEL_CLASS}>
              <span>State</span>
              <input
                name="state"
                defaultValue={values?.state ?? ""}
                placeholder="FL"
                className={INPUT_CLASS}
              />
            </label>

            <label className={LABEL_CLASS}>
              <span>Zip code</span>
              <input
                name="zipCode"
                defaultValue={values?.zipCode ?? ""}
                placeholder="33101"
                className={INPUT_CLASS}
              />
            </label>
          </div>
        </div>

        {/* Guests */}
        <div className={SECTION_CLASS}>
          <SectionHeader>Guests</SectionHeader>
          <div className="grid gap-5 p-6 md:grid-cols-2">
            <label className={LABEL_CLASS}>
              <span>Adults</span>
              <input
                name="guestCountAdults"
                type="number"
                min={0}
                defaultValue={values?.guestCountAdults ?? ""}
                placeholder="0"
                className={INPUT_CLASS}
              />
            </label>

            <label className={LABEL_CLASS}>
              <span>Children</span>
              <input
                name="guestCountChildren"
                type="number"
                min={0}
                defaultValue={values?.guestCountChildren ?? ""}
                placeholder="0"
                className={INPUT_CLASS}
              />
            </label>
          </div>
        </div>

        {/* Vision notes */}
        <div className={SECTION_CLASS}>
          <SectionHeader>Vision notes</SectionHeader>
          <div className="p-6">
            <textarea
              name="visionNotes"
              rows={5}
              defaultValue={values?.visionNotes ?? ""}
              placeholder="Describe the client's vision, style preferences, special requests…"
              className="w-full resize-y rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-300 focus:border-primary/40 focus:ring-4 focus:ring-primary/15"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2"
          >
            {submitLabel}
          </button>
          <Link
            href={cancelHref}
            className="inline-flex h-11 items-center justify-center rounded-full border border-stone-200 px-6 text-sm font-medium text-stone-600 transition hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </section>
  );
}
