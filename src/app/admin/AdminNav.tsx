"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/items", label: "Items" },
  { href: "/admin/boxes", label: "Boxes" },
  { href: "/admin/stock-in", label: "Stock In" },
  { href: "/admin/returns", label: "Returns" },
  { href: "/admin/transactions", label: "Transactions" },
  { href: "/admin/usage", label: "Usage" },
  { href: "/admin/settings", label: "Settings" },
];

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive =
    href === "/admin"
      ? pathname === "/admin"
      : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-indigo-100 text-indigo-800"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {label}
    </Link>
  );
}

export function AdminNav() {
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href={isLogin ? "/admin/login" : "/admin"}
          className="shrink-0 text-lg font-semibold tracking-tight text-slate-800 hover:text-indigo-600"
        >
          Stock Admin
        </Link>
        <nav className="flex flex-wrap items-center justify-end gap-0.5">
          {isLogin ? (
            <span className=" rounded-lg px-3 py-2 text-sm text-slate-500">Login</span>
          ) : (
            navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))
          )}
        </nav>
      </div>
    </header>
  );
}
