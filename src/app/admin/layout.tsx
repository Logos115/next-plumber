import type { Metadata } from "next";
import { AdminNav } from "./AdminNav";

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage items, boxes, and stock. Stock & Box admin dashboard.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100/80">
      <AdminNav />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
