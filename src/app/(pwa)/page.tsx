import Link from "next/link";
import { InstallButton } from "./InstallButton";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-6 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-lg text-center flex-1 flex flex-col justify-center">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
          Stock & Box Logging
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Log usage from boxes via QR or link.
        </p>
        <div className="flex flex-col gap-4 justify-center items-center">
          <InstallButton />
          <span className="text-slate-400 dark:text-slate-500 text-sm">
            Use your box link <code className="bg-slate-200 dark:bg-slate-700 px-1.5 rounded">/b/[token]</code>
          </span>
        </div>
      </div>
      <div className="w-full flex justify-end">
        <Link
          href="/admin"
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 mb-2 underline underline-offset-2"
        >
          Admin
        </Link>
      </div>
    </main>
  );
}
