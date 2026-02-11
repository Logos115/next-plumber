"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  name: string;
  unit: string;
  minStock: number | null;
  currentStock: number;
};

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("EACH");
  const [minStock, setMinStock] = useState<number | "">("");

  async function load() {
    const res = await fetch("/api/admin/items");
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function createItem(e: React.FormEvent) {
    e.preventDefault();

    await fetch("/api/admin/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        unit,
        minStock: minStock === "" ? null : Number(minStock),
      }),
    });

    setName("");
    setMinStock("");
    load();
  }

  async function updateMinStock(id: string, minStock: number | "") {
    const value = minStock === "" ? null : minStock;
    const res = await fetch(`/api/admin/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ minStock: value }),
    });
    if (res.ok) load();
  }

  async function deleteItem(id: string) {
    await fetch(`/api/admin/items/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <main>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Items</h1>
        <p className="mt-1 text-sm text-slate-500">Manage inventory items</p>
      </div>

      <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Add item</h2>
        </div>
        <div className="p-5">
        <form
          onSubmit={createItem}
          className="flex flex-wrap items-end gap-3 gap-y-4"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Name</span>
            <input
              className="w-44 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:w-52"
              placeholder="Item name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Unit</span>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            >
              <option value="EACH">Each</option>
              <option value="METRE">Metre</option>
              <option value="BOX">Box</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Min stock</span>
            <input
              className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="—"
              type="number"
              value={minStock}
              onChange={(e) =>
                setMinStock(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Add item
          </button>
        </form>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-5 py-3 text-left text-sm font-medium text-slate-600">
                  Name
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
                <th className="px-5 py-3 text-right text-sm font-medium text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr
                  key={i.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                >
                  <td className="px-5 py-3 text-slate-800">{i.name}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {i.unit.toLowerCase()}
                  </td>
                  <td className="px-5 py-3 text-slate-800">{i.currentStock}</td>
                  <td className="px-5 py-3">
                    <input
                      type="number"
                      min={0}
                      className="w-20 rounded border border-slate-300 px-2 py-1 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      value={i.minStock ?? ""}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((it) =>
                            it.id === i.id
                              ? {
                                  ...it,
                                  minStock:
                                    e.target.value === ""
                                      ? null
                                      : Number(e.target.value),
                                }
                              : it
                          )
                        )
                      }
                      onBlur={(e) => {
                        const v = e.target.value;
                        updateMinStock(
                          i.id,
                          v === "" ? "" : Math.max(0, Number(v))
                        );
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.currentTarget.blur();
                        }
                      }}
                      placeholder="—"
                    />
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => deleteItem(i.id)}
                      className="rounded-md px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Delete
                    </button>
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
