"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

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

function NavLink({
  href,
  label,
  isActive,
  onClick,
}: {
  href: string;
  label: string;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
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
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <header className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href={isLogin ? "/admin/login" : "/admin"}
          className="shrink-0 text-lg font-semibold tracking-tight text-slate-800 hover:text-indigo-600"
        >
          Stock Admin
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex md:flex-wrap md:items-center md:justify-end md:gap-0.5">
          {isLogin ? (
            <span className="rounded-lg px-3 py-2 text-sm text-slate-500">
              Login
            </span>
          ) : (
            navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                isActive={isActive(link.href)}
              />
            ))
          )}
        </nav>

        {/* Mobile menu button */}
        {!isLogin && (
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        )}
      </div>

      {/* Mobile dropdown */}
      {!isLogin && menuOpen && (
        <nav className="md:hidden border-t border-slate-200 bg-white px-4 py-3">
          <div className="flex flex-col gap-0.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                isActive={isActive(link.href)}
                onClick={() => setMenuOpen(false)}
              />
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
