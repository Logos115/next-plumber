"use client";

import { useEffect, useState } from "react";

type JobSummary = {
  jobNumber: string;
  items: Array<{ itemId: string; itemName: string; unit: string; totalQty: number }>;
  deviceIds: string[];
};
type Item = { id: string; name: string };

export default function UsagePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [jobNumber, setJobNumber] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [itemId, setItemId] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [transactionCount, setTransactionCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    fetch("/api/admin/items")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    setJobs([]);
    setSearched(false);
  }, [jobNumber, dateFrom, dateTo, itemId, deviceId]);

  function buildParams() {
    const params = new URLSearchParams();
    if (jobNumber.trim()) params.set("jobNumber", jobNumber.trim());
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (itemId) params.set("itemId", itemId);
    if (deviceId.trim()) params.set("deviceId", deviceId.trim());
    return params;
  }

  function exportCsv() {
    const params = buildParams();
    params.set("format", "csv");
    window.open(`/api/admin/usage?${params}`, "_blank");
  }

  function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(true);
    fetch(`/api/admin/usage?${buildParams()}`)
      .then((r) => r.json())
      .then((data) => {
        setJobs(data.jobs ?? []);
        setTransactionCount(data.transactionCount ?? 0);
      })
      .catch(() => {
        setJobs([]);
        setTransactionCount(0);
      })
      .finally(() => setLoading(false));
  }

  return (
    <main>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Usage by Job</h1>
        <p className="mt-1 text-sm text-slate-500">
          Filter usage by job, date range, item, or engineer. Export CSV for Tradify.
        </p>
      </div>

      <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Filters</h2>
        </div>
        <div className="p-5">
        <form onSubmit={search} className="flex flex-wrap gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Job number</span>
            <input
              type="text"
              placeholder="e.g. 12345 or partial"
              className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={jobNumber}
              onChange={(e) => setJobNumber(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Date from</span>
            <input
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Date to</span>
            <input
              type="date"
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Item</span>
            <select
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
            >
              <option value="">All items</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">Engineer (device)</span>
            <input
              type="text"
              placeholder="Device ID"
              className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {loading ? "Searching…" : "Search"}
            </button>
            <button
              type="button"
              onClick={exportCsv}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Export CSV
            </button>
          </div>
        </form>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Results
          {searched && (
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({transactionCount} transaction{transactionCount !== 1 ? "s" : ""})
            </span>
          )}
        </h2>
        </div>
        {loading && (
          <p className="px-5 py-8 text-center text-sm text-slate-500">Loading…</p>
        )}
        {!loading && searched && jobs.length === 0 && (
          <p className="px-5 py-8 text-center text-sm text-slate-500">
            No usage found matching the filters.
          </p>
        )}
        {!loading && jobs.length > 0 && (
          <div className="divide-y divide-slate-100 p-5">
            {jobs.map((job) => (
              <div key={job.jobNumber} className="py-4 first:pt-0">
                <div className="mb-3 flex items-baseline justify-between">
                  <h3 className="font-semibold text-slate-800">{job.jobNumber}</h3>
                  {job.deviceIds.length > 0 && (
                    <span className="text-xs text-slate-500">
                      Device{job.deviceIds.length > 1 ? "s" : ""}:{" "}
                      {job.deviceIds.map((d) => d.slice(0, 12)).join(", ")}
                    </span>
                  )}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-500">
                      <th className="pb-3 pr-4">Item</th>
                      <th className="pb-3 pr-4">Unit</th>
                      <th className="pb-3 text-right">Total qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.items.map((item) => (
                      <tr key={item.itemId} className="border-t border-slate-100">
                        <td className="py-2 pr-4 text-slate-800">{item.itemName}</td>
                        <td className="py-2 pr-4 text-slate-600">
                          {String(item.unit).toLowerCase()}
                        </td>
                        <td className="py-2 text-right font-medium text-slate-800">
                          {item.totalQty}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
