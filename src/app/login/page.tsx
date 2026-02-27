"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { signIn } from "next-auth/react";

const GENERIC_ERROR = "Invalid email or password.";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => !isSubmitting && email.trim().length > 0 && password.length > 0,
    [email, password, isSubmitting],
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/",
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setErrorMessage(GENERIC_ERROR);
      return;
    }

    router.push(result.url ?? "/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-stone-50 to-white px-4 py-14">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <div className="w-full rounded-3xl border border-rose-100 bg-white/90 p-6 shadow-[0_18px_60px_-25px_rgba(244,63,94,0.35)] backdrop-blur sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-700 shadow-sm">
              <span aria-hidden className="text-lg leading-none">
                ♥
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-900">
              Decora Florida
            </h1>
            <p className="mt-1 text-sm text-stone-600">
              Sign in to management
            </p>
          </div>

          {errorMessage ? (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {GENERIC_ERROR}
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-stone-800"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-base text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                placeholder="you@decoraflorida.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-stone-800"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full rounded-2xl border border-stone-200 bg-white px-4 text-base text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 inline-flex h-12 w-full items-center justify-center rounded-full bg-rose-600 px-6 text-base font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-stone-500">
          ♡ Softly styled for Decora Florida
        </p>
      </div>
    </div>
  );
}

