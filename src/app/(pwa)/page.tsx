import Link from "next/link";
import { InstallButton } from "./InstallButton";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-lg text-center">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-3">
          Stock & Box Logging
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          Log usage from boxes via QR or link. Admins manage items, boxes, and view stock.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center flex-wrap">
          <Link
            href="/admin"
            className="rounded-xl bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 px-6 py-3 font-semibold hover:bg-slate-700 dark:hover:bg-slate-300 transition-colors"
          >
            Admin
          </Link>
          <InstallButton />
          <span className="text-slate-400 dark:text-slate-500 text-sm self-center w-full sm:w-auto">
            Engineers: use your box link <code className="bg-slate-200 dark:bg-slate-700 px-1.5 rounded">/b/[token]</code>
          </span>
        </div>
      </div>
    </main>
  );
}
