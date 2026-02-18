"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

function LogoMark() {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-900 text-white shadow-sm">
      <span className="text-sm font-semibold tracking-wide">DF</span>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [callbackUrl] = useState(() => {
    if (typeof window === "undefined") return "/dashboard";
    const params = new URLSearchParams(window.location.search);
    return params.get("callbackUrl") ?? "/dashboard";
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-12">
      <div className="rounded-3xl border border-black/5 bg-white/80 p-8 shadow-sm backdrop-blur">
        <div className="flex items-center gap-4">
          <LogoMark />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
              DeCora Florida
            </h1>
            <p className="text-sm text-zinc-600">
              Management portal (managers only)
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-800">Email</label>
            <input
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none ring-emerald-500/30 placeholder:text-zinc-400 focus:ring-4"
              autoComplete="email"
              inputMode="email"
              name="email"
              placeholder="manager@decoraflorida.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={pending}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-800">
              Password
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none ring-emerald-500/30 placeholder:text-zinc-400 focus:ring-4"
              autoComplete="current-password"
              name="password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={pending}
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          ) : null}

          <button
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-800 disabled:opacity-60"
            disabled={pending || !email || !password}
            onClick={() => {
              setError(null);
              startTransition(async () => {
                const result = await signIn("credentials", {
                  email,
                  password,
                  redirect: false,
                  callbackUrl,
                });

                if (!result || result.error) {
                  setError("Invalid email or password.");
                  return;
                }

                router.push(result.url ?? callbackUrl);
              });
            }}
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>

          <p className="text-center text-xs text-zinc-500">
            Need access? Ask an admin to create your manager account.
          </p>
        </div>
      </div>

      <p className="mt-8 text-center text-xs text-zinc-500">
        decoraflorida.com
      </p>
    </div>
  );
}
