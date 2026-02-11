"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type HistoryEntry = {
  type: "action" | "edit";
  action: string;
  actorType?: string;
  actorEmail?: string | null;
  actorDeviceId?: string | null;
  timestamp: string;
  details?: unknown;
  oldQuantity?: number;
  newQuantity?: number;
  oldJobNumber?: string | null;
  newJobNumber?: string | null;
};

type TransactionDetail = {
  transaction: {
    id: string;
    type: string;
    quantity: number;
    jobNumber: string | null;
    deviceId: string | null;
    createdAt: string;
    item: { name: string; unit: string };
    box: { label: string; token: string };
  };
  history: HistoryEntry[];
};

export default function TransactionDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : null;
  const [data, setData] = useState<TransactionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/transactions/${id}`)
      .then((r) => {
        if (!r.ok) return null;
        return r.json();
      })
      .then((d) => {
        if (d && typeof d === "object" && d.transaction) setData(d);
        else setData(null);
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [id]);

  const formatDate = (s: string) =>
    new Date(s).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const actorLabel = (e: HistoryEntry) => {
    if (e.actorEmail) return e.actorEmail;
    if (e.actorDeviceId)
      return `Device ${String(e.actorDeviceId).slice(0, 8)}…`;
    if (e.actorType === "ADMIN") return "Admin";
    if (e.actorType === "ENGINEER") return "Engineer";
    return "—";
  };

  if (!id) {
    return (
      <main>
        <p className="text-slate-500">Invalid transaction ID.</p>
        <Link href="/admin/transactions" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
          ← Back to transactions
        </Link>
      </main>
    );
  }

  if (loading || !data) {
    return (
      <main>
        <p className="text-slate-500">{loading ? "Loading…" : "Transaction not found."}</p>
        {!loading && (
          <Link href="/admin/transactions" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
            ← Back to transactions
          </Link>
        )}
      </main>
    );
  }

  const t = data.transaction;

  return (
    <main>
      <div className="mb-8">
        <Link
          href="/admin/transactions"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          ← Back to transactions
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Transaction</h1>
        <p className="mt-1 text-sm text-slate-500">Details and change history</p>
      </div>

      <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Details</h2>
        </div>
        <div className="p-5">
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <dt className="text-slate-500">Type</dt>
          <dd className="text-slate-800">{t.type}</dd>
          <dt className="text-slate-500">Item</dt>
          <dd className="text-slate-800">{t.item.name}</dd>
          <dt className="text-slate-500">Box</dt>
          <dd className="text-slate-800">{t.box.label}</dd>
          <dt className="text-slate-500">Quantity</dt>
          <dd className="text-slate-800">{t.quantity} {String(t.item.unit).toLowerCase()}</dd>
          <dt className="text-slate-500">Job / reference</dt>
          <dd className="text-slate-800">{t.jobNumber ?? "—"}</dd>
          <dt className="text-slate-500">Created</dt>
          <dd className="text-slate-800">{formatDate(t.createdAt)}</dd>
        </dl>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Change history</h2>
        </div>
        <div className="p-5">
        {data.history.length === 0 ? (
          <p className="text-sm text-slate-500">No change history recorded.</p>
        ) : (
          <ol className="space-y-4">
            {data.history.map((e, i) => (
              <li
                key={i}
                className="flex flex-col gap-1 border-l-2 border-slate-200 pl-4"
              >
                <div className="flex flex-wrap items-baseline gap-2 text-sm">
                  <span className="font-medium text-slate-800">
                    {e.action === "CREATE" ? "Created" : e.action === "UPDATE" ? "Edited" : e.action}
                  </span>
                  <span className="text-slate-500">by {actorLabel(e)}</span>
                  <span className="text-slate-500">
                    {formatDate(e.timestamp)}
                  </span>
                </div>
                {e.type === "edit" && (
                  <div className="text-xs text-slate-600">
                    {e.oldQuantity !== undefined && e.newQuantity !== undefined && (
                      <p>Quantity: {e.oldQuantity} → {e.newQuantity}</p>
                    )}
                    {(e.oldJobNumber !== undefined || e.newJobNumber !== undefined) && (
                      <p>
                        Job: {e.oldJobNumber ?? "—"} → {e.newJobNumber ?? "—"}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}
        </div>
      </section>
    </main>
  );
}
