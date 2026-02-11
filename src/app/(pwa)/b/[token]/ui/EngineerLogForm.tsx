"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type BoxItemInfo = { id: string; name: string; unit: string };
type BoxResponse =
  | {
      ok: true;
      box: { label: string; token: string };
      items: BoxItemInfo[];
      item?: BoxItemInfo; // present when items.length === 1 (backward compat)
    }
  | { ok: false; message: string };

type SubmitState = "idle" | "loading" | "success" | "error" | "editing";

type LastTxn = {
  id: string;
  jobNumber: string;
  quantity: number;
};

export default function EngineerLogForm({ token }: { token: string }) {
  const [boxData, setBoxData] = useState<BoxResponse | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [jobNumber, setJobNumber] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [warningMsg, setWarningMsg] = useState<string>("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [lastTxn, setLastTxn] = useState<LastTxn | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const jobRef = useRef<HTMLInputElement | null>(null);

  const selectedItem =
    boxData?.ok && boxData.items.length > 0
      ? boxData.items.find((i) => i.id === selectedItemId) ?? boxData.items[0]
      : null;

  // Fetch box + item on load
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/boxes/${encodeURIComponent(token)}`, { cache: "no-store" });
        const json = (await res.json()) as BoxResponse;
        if (!cancelled) setBoxData(json);
      } catch {
        if (!cancelled) setBoxData({ ok: false, message: "Failed to load box. Check signal." });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Set default selected item when box has multiple items
  useEffect(() => {
    if (boxData?.ok && boxData.items.length > 0 && !selectedItemId) {
      setSelectedItemId(boxData.items[0].id);
    }
  }, [boxData, selectedItemId]);

  // Autofocus job number when ready
  useEffect(() => {
    if (boxData?.ok) jobRef.current?.focus();
  }, [boxData]);

  const canSubmit = useMemo(() => {
    if (!boxData?.ok || !selectedItem) return false;
    if (!jobNumber.trim()) return false;
    if (!Number.isFinite(qty) || qty <= 0) return false;
    return submitState !== "loading";
  }, [boxData, selectedItem, jobNumber, qty, submitState]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;
    setErrorMsg("");
    setSubmitState("loading");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "USAGE",
          boxToken: token,
          itemId: selectedItem.id,
          jobNumber: jobNumber.trim(),
          quantity: qty,
        }),
      });

      if (!res.ok) {
        const t = await safeText(res);
        throw new Error(t || "Submit failed");
      }

      const json = await res.json();
      setWarningMsg(json?.warning?.message || "");
      setLastTxn(
        json?.transaction?.id
          ? { id: json.transaction.id, jobNumber: jobNumber.trim(), quantity: qty }
          : null
      );
      setSubmitState("success");
    } catch (err) {
      setSubmitState("error");
      setErrorMsg(err instanceof Error ? err.message : "Submit failed");
    }
  }

  function resetForAnother() {
    setSubmitState("idle");
    setErrorMsg("");
    setWarningMsg("");
    setLastTxn(null);
    setJobNumber("");
    setQty(1);
    setTimeout(() => jobRef.current?.focus(), 0);
  }

  function startEdit() {
    if (!lastTxn) return;
    setJobNumber(lastTxn.jobNumber);
    setQty(lastTxn.quantity);
    setErrorMsg("");
    setSubmitState("editing");
    setTimeout(() => jobRef.current?.focus(), 0);
  }

  async function onSubmitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!lastTxn) return;
    setErrorMsg("");
    setEditLoading(true);

    try {
      const res = await fetch(`/api/transactions/${lastTxn.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobNumber: jobNumber.trim(),
          quantity: qty,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 403 && json?.code === "EDIT_WINDOW_EXPIRED") {
          throw new Error("Edit window has expired.");
        }
        const msg =
          typeof json === "object" && json?.message
            ? json.message
            : typeof json === "string"
              ? json
              : "Edit failed";
        throw new Error(msg);
      }

      setWarningMsg(json?.warning?.message || "");
      setLastTxn({ ...lastTxn, jobNumber: jobNumber.trim(), quantity: qty });
      setSubmitState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Edit failed");
    } finally {
      setEditLoading(false);
    }
  }

  const cardClass =
    "w-full max-w-[520px] h-fit rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 backdrop-blur-sm p-6 sm:p-8";

  // Loading state
  if (!boxData) {
    return (
      <section className={cardClass}>
        <div className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Loading…</div>
      </section>
    );
  }

  // Error loading box
  if (!boxData.ok) {
    return (
      <section className={cardClass}>
        <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">Box not available</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{boxData.message}</p>
      </section>
    );
  }

  // Edit form screen (after clicking "Edit last")
  if (submitState === "editing" && lastTxn) {
    const canEdit =
      Number.isFinite(qty) && qty > 0 && jobNumber.trim() && !editLoading;
    return (
      <section className={cardClass}>
        <div className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-1">
          Edit last submission
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-6">
          {selectedItem?.name}
        </h2>

        <form onSubmit={onSubmitEdit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Job number
            <input
              ref={jobRef}
              className="text-lg px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent"
              inputMode="text"
              placeholder="e.g. T-10482"
              value={jobNumber}
              onChange={(e) => setJobNumber(e.target.value)}
              autoComplete="off"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
            Quantity
            <input
              className="text-lg px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent"
              inputMode="numeric"
              pattern="[0-9]*"
              value={String(qty)}
              onChange={(e) => {
                const next = parseInt(e.target.value || "0", 10);
                setQty(Number.isFinite(next) ? next : 1);
              }}
            />
          </label>

          {errorMsg && (
            <div className="rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 text-sm py-3 px-4">
              {errorMsg}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setSubmitState("success");
                setJobNumber(lastTxn.jobNumber);
                setQty(lastTxn.quantity);
                setErrorMsg("");
              }}
              className="flex-1 text-base font-bold py-3.5 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canEdit}
              className={`flex-1 text-base font-bold py-3.5 px-4 rounded-xl border-0 cursor-pointer transition-all ${
                canEdit
                  ? "bg-indigo-600 text-white hover:bg-indigo-700"
                  : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              }`}
            >
              {editLoading ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      </section>
    );
  }

  // Success screen
  if (submitState === "success") {
    const displayJob = lastTxn?.jobNumber ?? jobNumber.trim();
    const displayQty = lastTxn?.quantity ?? qty;
    return (
      <section className={cardClass + " text-center"}>
        <div className="text-4xl mb-3">✅</div>
        <h1 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">Saved</h1>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-5">
          {displayJob} • {selectedItem?.name} • Qty {displayQty} ({selectedItem?.unit})
        </p>

        <div className="flex flex-col gap-3">
          {lastTxn && (
            <button
              type="button"
              onClick={startEdit}
              className="w-full text-base font-bold py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Edit last submission
            </button>
          )}
          <button
            type="button"
            onClick={resetForAnother}
            className="w-full text-base font-bold py-3.5 px-4 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Log another
          </button>
        </div>
      </section>
    );
  }

  // Main form screen
  return (
    <section className={cardClass}>
      <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
        {boxData.box.label}
      </div>
      {boxData.items.length > 1 ? (
        <label className="mb-2 block">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Item</span>
          <select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            className="mt-1 block w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400"
          >
            {boxData.items.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} ({i.unit})
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-1">
        {selectedItem?.name}
      </h2>
      <div className="text-slate-500 dark:text-slate-400 text-sm mb-6">Unit: {selectedItem?.unit}</div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4 mt-6">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Job number
          <input
            ref={jobRef}
            className="text-lg px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 transition-shadow"
            inputMode="text"
            placeholder="e.g. T-10482"
            value={jobNumber}
            onChange={(e) => setJobNumber(e.target.value)}
            autoComplete="off"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
          Quantity
          <input
            className="text-lg px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:border-transparent transition-shadow"
            inputMode="numeric"
            pattern="[0-9]*"
            value={String(qty)}
            onChange={(e) => {
              const next = parseInt(e.target.value || "0", 10);
              setQty(Number.isFinite(next) ? next : 1);
            }}
          />
        </label>

        {warningMsg && (
          <div className="rounded-xl border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-sm py-3 px-4 flex items-start gap-2">
            <span aria-hidden>⚠️</span>
            <span>{warningMsg}</span>
          </div>
        )}

        {submitState === "error" && (
          <div className="rounded-xl border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 text-sm py-3 px-4">
            <strong>Couldn’t save.</strong> {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className={`w-full text-base font-bold py-3.5 px-4 rounded-xl border-0 cursor-pointer transition-all ${
            canSubmit
              ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg active:scale-[0.99]"
              : "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          }`}
        >
          {submitState === "loading" ? "Saving…" : "Submit"}
        </button>
      </form>
    </section>
  );
}

async function safeText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
