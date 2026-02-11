"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Item = { id: string; name: string };
type Box = { id: string; label: string; token: string; items: Item[] };

export default function ReturnsPage() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [boxId, setBoxId] = useState("");
  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [jobNumber, setJobNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const selectedBox = boxes.find((b) => b.id === boxId);
  const items = selectedBox?.items ?? [];

  useEffect(() => {
    fetch("/api/admin/boxes")
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setBoxes(list);
        const firstWithItems = list.find((b: Box) => b.items?.length > 0);
        if (firstWithItems) setBoxId(firstWithItems.id);
      })
      .catch(() => setBoxes([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setItemId("");
    if (items.length === 1) setItemId(items[0].id);
  }, [boxId, items.length]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!boxId || !itemId || quantity === "" || Number(quantity) <= 0) return;
    setMessage(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          boxId,
          itemId,
          quantity: Number(quantity),
          jobNumber: jobNumber.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({
          type: "err",
          text: typeof data === "string" ? data : (data?.message ?? "Failed to record return"),
        });
        return;
      }
      const unit = data.unit ?? "";
      setMessage({
        type: "ok",
        text: `Recorded return of ${data.transaction?.quantity ?? quantity} ${String(unit).toLowerCase()} for ${data.itemName ?? "item"}. New stock: ${data.newStock ?? "—"}.`,
      });
      setQuantity("");
      setJobNumber("");
    } catch {
      setMessage({ type: "err", text: "Could not record return." });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main>
        <p className="text-slate-500">Loading…</p>
      </main>
    );
  }

  const boxesWithItems = boxes.filter((b) => b.items?.length > 0);

  return (
    <main>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Returns to Stock</h1>
        <p className="mt-1 text-sm text-slate-500">Log unused materials returned</p>
      </div>

      {boxesWithItems.length === 0 && (
        <p className="mb-6 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-800 shadow-sm">
          No boxes with items yet. Create boxes and link items on the{" "}
          <Link href="/admin/boxes" className="font-medium text-amber-900 underline">
            Boxes
          </Link>{" "}
          page first.
        </p>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Record return</h2>
        </div>
        <div className="p-5">
        <form onSubmit={submit} className="flex flex-col gap-4 max-w-md">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Box</span>
            <select
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={boxId}
              onChange={(e) => setBoxId(e.target.value)}
            >
              <option value="">Select a box</option>
              {boxesWithItems.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Item</span>
            <select
              required
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              disabled={items.length === 0}
            >
              <option value="">Select an item</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Quantity</span>
            <input
              type="number"
              min={1}
              required
              className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={quantity === "" ? "" : quantity}
              onChange={(e) =>
                setQuantity(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">
              Job number <span className="text-slate-400">(optional)</span>
            </span>
            <input
              type="text"
              placeholder="e.g. job the materials came back from"
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={jobNumber}
              onChange={(e) => setJobNumber(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={submitting || !boxId || !itemId || quantity === "" || Number(quantity) <= 0}
            className="w-fit rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {submitting ? "Recording…" : "Record return"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-sm ${message.type === "ok" ? "text-green-600" : "text-red-600"}`}
          >
            {message.text}
          </p>
        )}
        </div>
      </section>
    </main>
  );
}
