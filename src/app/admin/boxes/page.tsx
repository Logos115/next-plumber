"use client";

import { useEffect, useState } from "react";

type Item = { id: string; name: string };
type Box = { id: string; label: string; token: string; item: Item };

export default function BoxesPage() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [label, setLabel] = useState("");
  const [itemId, setItemId] = useState("");

  async function load() {
    const b = await fetch("/api/admin/boxes").then((r) => r.json());
    const i = await fetch("/api/admin/items").then((r) => r.json());
    setBoxes(b);
    setItems(i);
  }

  useEffect(() => {
    load();
  }, []);

  async function createBox(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/admin/boxes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, itemId }),
    });

    setLabel("");
    load();
  }

  return (
    <main>
      <h1 className="mb-6 text-2xl font-bold text-slate-800">Boxes</h1>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          Create box
        </h2>
        <form
          onSubmit={createBox}
          className="flex flex-wrap items-end gap-3 gap-y-4"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Box label</span>
            <input
              className="w-44 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-52"
              placeholder="e.g. Shelf A1"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Item</span>
            <select
              className="min-w-[140px] rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              required
            >
              <option value="">Select item</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Create box
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  Label
                </th>
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  Item
                </th>
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  QR link
                </th>
              </tr>
            </thead>
            <tbody>
              {boxes.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                >
                  <td className="px-5 py-3 text-slate-800">{b.label}</td>
                  <td className="px-5 py-3 text-slate-600">{b.item.name}</td>
                  <td className="px-5 py-3">
                    <a
                      href={`/b/${b.token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      /b/{b.token}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
