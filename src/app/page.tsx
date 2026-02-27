import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

import { SignOutButton } from "@/src/components/SignOutButton";
import { authOptions } from "@/src/server/authOptions";

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-stone-50 to-white px-4 py-14">
      <main className="mx-auto w-full max-w-2xl">
        <div className="rounded-3xl border border-rose-100 bg-white/90 p-6 shadow-[0_18px_60px_-25px_rgba(244,63,94,0.35)] backdrop-blur sm:p-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700">
                <span aria-hidden>♥</span>
                <span>Decora Florida Management</span>
              </div>
              <h1 className="text-4xl font-semibold tracking-tight text-stone-900">
                Coming Soon
              </h1>
              <p className="mt-3 max-w-prose text-base leading-7 text-stone-600">
                We’re polishing the details. In the meantime, you’re signed in
                and ready for what’s next.
              </p>
              <p className="mt-4 text-sm text-stone-500">
                Signed in as{" "}
                <span className="font-medium text-stone-700">
                  {session.user.email}
                </span>
                {" · "}
                <span className="font-medium text-stone-700">
                  {session.user.role}
                </span>
              </p>
            </div>
            <SignOutButton />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl border border-stone-200 bg-white/70 p-6 shadow-sm">
            <div className="text-sm font-semibold text-stone-800">Next up</div>
            <div className="mt-2 text-sm text-stone-600">
              Inquiries, proposals, and bookings.
            </div>
          </div>
          <div className="rounded-3xl border border-stone-200 bg-white/70 p-6 shadow-sm">
            <div className="text-sm font-semibold text-stone-800">Little love</div>
            <div className="mt-2 text-sm text-stone-600">
              Soft hearts, warm neutrals, and lots of whitespace.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
