import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const items = await prisma.item.findMany({
    select: { id: true, name: true, unit: true, currentStock: true, minStock: true },
    orderBy: { name: "asc" },
  });

  const lowStock = items.filter(
    (i) =>
      (i.minStock !== null && i.currentStock <= i.minStock) ||
      i.currentStock < 0
  );

  return (
    <main>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">Overview of stock levels</p>
      </div>

      <section className="mb-6 overflow-hidden rounded-xl border border-amber-200/80 bg-amber-50/90 shadow-sm ring-1 ring-amber-100/50">
        <div className="border-b border-amber-200/60 bg-amber-100/40 px-5 py-3">
          <h2 className="text-lg font-semibold text-amber-900">
            Low stock
          </h2>
        </div>
        <div className="p-5">
        {lowStock.length > 0 ? (
          <>
            <ul className="list-inside list-disc space-y-1 text-sm text-amber-800">
              {lowStock.map((i) => (
                <li key={i.id}>
                  {i.name}: <strong>{i.currentStock}</strong>{" "}
                  {String(i.unit).toLowerCase()}
                  {i.minStock !== null ? ` (min ${i.minStock})` : ""}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-amber-700">
              Set minimum thresholds per item on{" "}
              <Link href="/admin/items" className="font-medium underline">
                Items
              </Link>
              . Enable optional email alerts in{" "}
              <Link href="/admin/settings" className="font-medium underline">
                Settings
              </Link>
              .
            </p>
          </>
        ) : (
          <p className="text-sm text-amber-800/90">
            No items below their minimum. Set min stock per item on{" "}
            <Link href="/admin/items" className="font-medium text-amber-900 underline">
              Items
            </Link>
            ; enable email alerts in{" "}
            <Link href="/admin/settings" className="font-medium text-amber-900 underline">
              Settings
            </Link>
            .
          </p>
        )}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">All Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  Item
                </th>
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  Unit
                </th>
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  Stock
                </th>
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  Min
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr
                  key={i.id}
                  className="border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/50"
                >
                  <td className="px-5 py-3 text-slate-800">{i.name}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {String(i.unit).toLowerCase()}
                  </td>
                  <td className="px-5 py-3 text-slate-800">{i.currentStock}</td>
                  <td className="px-5 py-3 text-slate-600">{i.minStock ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
