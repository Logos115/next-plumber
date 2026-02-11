"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BoxQRCode } from "./BoxQRCode";

type Item = { id: string; name: string };
type Box = { id: string; label: string; token: string; active?: boolean; items: Item[] };

export default function BoxesPage() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [label, setLabel] = useState("");
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editItemIds, setEditItemIds] = useState<string[]>([]);

  async function load() {
    const [b, i] = await Promise.all([
      fetch("/api/admin/boxes").then((r) => r.json()),
      fetch("/api/admin/items").then((r) => r.json()),
    ]);
    setBoxes(b);
    setItems(i);
  }

  useEffect(() => {
    load();
  }, []);

  async function createBox(e: React.FormEvent) {
    e.preventDefault();
    if (itemIds.length === 0) return;
    await fetch("/api/admin/boxes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: label.trim(), itemIds }),
    });
    setLabel("");
    setItemIds([]);
    load();
  }

  function startEdit(box: Box) {
    setEditingId(box.id);
    setEditLabel(box.label);
    setEditItemIds(box.items.map((it) => it.id));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditLabel("");
    setEditItemIds([]);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId || editItemIds.length === 0) return;
    await fetch(`/api/admin/boxes/${editingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: editLabel.trim(), itemIds: editItemIds }),
    });
    cancelEdit();
    load();
  }

  async function deleteBox(id: string) {
    if (!confirm("Delete this box? QR link will stop working.")) return;
    await fetch(`/api/admin/boxes/${id}`, { method: "DELETE" });
    load();
  }

  function toggleCreateItem(id: string) {
    setItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleEditItem(id: string) {
    setEditItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  return (
    <main>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Boxes</h1>
        <p className="mt-1 text-sm text-slate-500">Manage boxes and QR links</p>
      </div>

      <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Create box</h2>
        </div>
        <div className="p-5">
        <form
          onSubmit={createBox}
          className="flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Box label</span>
            <input
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-52"
              placeholder="e.g. Shelf A1"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </label>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Items (one or more)</span>
            {items.length === 0 ? (
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800">
                No items yet.{" "}
                <Link href="/admin/items" className="font-medium text-indigo-600 underline hover:text-indigo-700">
                  Create items on the Items page
                </Link>
                , then they’ll appear here as checkboxes so you can link one or more to this box.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {items.map((i) => (
                  <label
                    key={i.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-slate-100 has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50"
                  >
                    <input
                      type="checkbox"
                      checked={itemIds.includes(i.id)}
                      onChange={() => toggleCreateItem(i.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-800">{i.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={itemIds.length === 0}
            className="w-fit rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Create box
          </button>
        </form>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  Label
                </th>
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  Items
                </th>
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  QR link
                </th>
                <th className="px-5 py-3 text-right text-sm font-medium text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {boxes.map((b) =>
                editingId === b.id ? (
                  <tr key={b.id} className="border-b border-slate-100 bg-amber-50/50">
                    <td colSpan={4} className="px-5 py-4">
                      <form onSubmit={saveEdit} className="flex flex-col gap-3">
                        <label className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-slate-500">Label</span>
                          <input
                            className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            required
                          />
                        </label>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-medium text-slate-500">Items</span>
                          <div className="flex flex-wrap gap-2">
                            {items.map((i) => (
                              <label
                                key={i.id}
                                className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"
                              >
                                <input
                                  type="checkbox"
                                  checked={editItemIds.includes(i.id)}
                                  onChange={() => toggleEditItem(i.id)}
                                  className="rounded border-slate-300 text-indigo-600"
                                />
                                <span className="text-sm">{i.name}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={editItemIds.length === 0}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                ) : (
                  <tr
                    key={b.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-3 text-slate-800">{b.label}</td>
                    <td className="px-5 py-3 text-slate-600">
                      {b.items.length === 0
                        ? "—"
                        : b.items.map((it) => it.name).join(", ")}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <a
                          href={`/b/${b.token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:underline"
                        >
                          /b/{b.token}
                        </a>
                        <BoxQRCode token={b.token} label={b.label} />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => startEdit(b)}
                        className="mr-2 text-sm text-indigo-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteBox(b.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
