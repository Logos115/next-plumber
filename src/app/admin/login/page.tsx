"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "CredentialsSignin") {
      setErr("Login failed. Check your email and password.");
    }
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: true,
      callbackUrl: "/admin",
    });

    if (res?.error) setErr("Login failed");
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <section className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md ring-1 ring-slate-900/5">
        <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5 sm:px-8">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Admin Login</h1>
        </div>
        <div className="p-6 sm:p-8">

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Email</span>
            <input
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              className="rounded-lg border border-slate-300 px-3 py-2.5 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>

          {err && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <button
            type="submit"
            className="mt-1 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Sign in
          </button>
        </form>
        </div>
      </section>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <main className="flex min-h-[60vh] items-center justify-center">
        <section className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-md ring-1 ring-slate-900/5">
          <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5 sm:px-8">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Admin Login</h1>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-slate-500">Loading…</p>
          </div>
        </section>
      </main>
    }>
      <LoginForm />
    </Suspense>
  );
}
