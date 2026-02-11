"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Transaction = {
  id: string;
  type: string;
  quantity: number;
  jobNumber: string | null;
  createdAt: string;
  item: { name: string; unit: string };
  box: { label: string; token: string };
};

export default function TransactionsPage() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load(cursor?: string) {
    setLoading(true);
    try {
      const url = cursor
        ? `/api/admin/transactions?limit=50&cursor=${cursor}`
        : "/api/admin/transactions?limit=50";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load");
      const data = (await res.json()) as {
        transactions: Transaction[];
        nextCursor: string | null;
      };
      setTxns((prev) => (cursor ? [...prev, ...data.transactions] : data.transactions));
      setNextCursor(data.nextCursor);
    } catch {
      setTxns([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const formatDate = (s: string) =>
    new Date(s).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });

  return (
    <main>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transactions</h1>
        <p className="mt-1 text-sm text-slate-500">View all transactions and change history</p>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  Date
                </th>
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  Type
                </th>
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  Item
                </th>
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  Box
                </th>
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  Qty
                </th>
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  Job / Ref
                </th>
                <th className="px-5 py-3 text-right text-sm font-medium text-slate-600">
                  History
                </th>
              </tr>
            </thead>
            <tbody>
              {txns.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                >
                  <td className="px-5 py-3 text-slate-600 text-sm">
                    <Link href={`/admin/transactions/${t.id}`} className="block hover:text-indigo-600">
                      {formatDate(t.createdAt)}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-800">{t.type}</td>
                  <td className="px-5 py-3 text-slate-800">{t.item.name}</td>
                  <td className="px-5 py-3 text-slate-600">{t.box.label}</td>
                  <td className="px-5 py-3 text-slate-800">{t.quantity}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {t.jobNumber ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link
                      href={`/admin/transactions/${t.id}`}
                      className="text-sm font-medium text-indigo-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading && (
          <p className="px-5 py-4 text-sm text-slate-500">Loading…</p>
        )}
        {!loading && txns.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No transactions yet.
          </p>
        )}
        {!loading && nextCursor && (
          <div className="border-t border-slate-200 px-5 py-3">
            <button
              type="button"
              onClick={() => load(nextCursor)}
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              Load more
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
