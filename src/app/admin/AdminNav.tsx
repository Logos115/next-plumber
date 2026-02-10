"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href={isLogin ? "/admin/login" : "/admin"}
          className="text-lg font-semibold text-slate-800 hover:text-slate-600"
        >
          Stock Admin
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {isLogin ? (
            <span className="text-sm text-slate-500">Login</span>
          ) : (
            <>
              <Link
                href="/admin"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/items"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Items
              </Link>
              <Link
                href="/admin/boxes"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Boxes
              </Link>
              <Link
                href="/admin/usage"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                Usage
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
