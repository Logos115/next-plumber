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
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Dashboard</h1>

      {lowStock.length > 0 && (
        <section className="mb-6 rounded-xl border border-amber-200 bg-amber-50/80 p-5 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-amber-900">
            Low / Negative Stock
          </h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-amber-800">
            {lowStock.map((i) => (
              <li key={i.id}>
                {i.name}: <strong>{i.currentStock}</strong> {String(i.unit).toLowerCase()}
                {i.minStock !== null ? ` (min ${i.minStock})` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">All Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 pr-4 text-left text-sm font-medium text-slate-600">
                  Item
                </th>
                <th className="pb-3 pr-4 text-left text-sm font-medium text-slate-600">
                  Unit
                </th>
                <th className="pb-3 pr-4 text-left text-sm font-medium text-slate-600">
                  Stock
                </th>
                <th className="pb-3 text-left text-sm font-medium text-slate-600">
                  Min
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr
                  key={i.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="py-3 pr-4 text-slate-800">{i.name}</td>
                  <td className="py-3 pr-4 text-slate-600">
                    {String(i.unit).toLowerCase()}
                  </td>
                  <td className="py-3 pr-4 text-slate-800">{i.currentStock}</td>
                  <td className="py-3 text-slate-600">{i.minStock ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
