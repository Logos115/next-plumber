"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Settings = {
  editWindowMinutes: number;
  lowStockAlertsEnabled: boolean;
  lowStockAlertEmail: string;
};

export default function SettingsPage() {
  const [editWindowMinutes, setEditWindowMinutes] = useState<number>(10);
  const [lowStockAlertsEnabled, setLowStockAlertsEnabled] = useState(false);
  const [lowStockAlertEmail, setLowStockAlertEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingAlert, setSendingAlert] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  async function load() {
    try {
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to load");
      const data = (await res.json()) as Settings;
      setEditWindowMinutes(data.editWindowMinutes);
      setLowStockAlertsEnabled(data.lowStockAlertsEnabled);
      setLowStockAlertEmail(data.lowStockAlertEmail ?? "");
    } catch {
      setMessage("Could not load settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function sendTestAlert() {
    setSendingAlert(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/alerts/low-stock", { method: "POST" });
      const data = (await res.json()) as {
        total: number;
        emailSent?: boolean;
        error?: string;
      };
      if (!res.ok) throw new Error("Request failed");
      if (data.emailSent) setMessage("Test alert email sent.");
      else if (data.total === 0)
        setMessage("No low-stock items; no email sent.");
      else if (data.error)
        setMessage(`Email not sent: ${data.error}`);
      else setMessage("Alert checked; email not configured or disabled.");
    } catch {
      setMessage("Could not send test alert.");
    } finally {
      setSendingAlert(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage("");
    if (newPassword !== confirmPassword) {
      setPasswordMessage("New password and confirmation do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMessage("New password must be at least 8 characters.");
      return;
    }
    setChangingPassword(true);
    try {
      const res = await fetch("/api/admin/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text || "Failed to change password");
      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMessage(
        err instanceof Error ? err.message : "Could not change password."
      );
    } finally {
      setChangingPassword(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editWindowMinutes,
          lowStockAlertsEnabled,
          lowStockAlertEmail: lowStockAlertEmail.trim() || null,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to save");
      }
      setMessage("Settings saved.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save settings.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main>
        <p className="text-slate-500">Loading…</p>
      </main>
    );
  }

  return (
    <main>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Configure app behaviour</p>
      </div>

      <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Edit window</h2>
        </div>
        <div className="p-5">
        <p className="mb-4 text-sm text-slate-600">
          Engineers can edit their last submission within this time window (in
          minutes).
        </p>
        <form onSubmit={save} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">
              Edit window (minutes)
            </span>
            <input
              type="number"
              min={1}
              max={1440}
              className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={editWindowMinutes}
              onChange={(e) =>
                setEditWindowMinutes(
                  Math.min(1440, Math.max(1, Number(e.target.value) || 1))
                )
              }
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-3 text-sm ${message.includes("saved") ? "text-green-600" : "text-red-600"}`}
          >
            {message}
          </p>
        )}
        </div>
      </section>

      <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Change password</h2>
        </div>
        <div className="p-5">
          <form onSubmit={changePassword} className="flex flex-col gap-4 max-w-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-500">
                Current password
              </span>
              <input
                type="password"
                autoComplete="current-password"
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-500">
                New password
              </span>
              <input
                type="password"
                autoComplete="new-password"
                minLength={8}
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-500">
                Confirm new password
              </span>
              <input
                type="password"
                autoComplete="new-password"
                className="rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </label>
            <button
              type="submit"
              disabled={changingPassword}
              className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60 self-start"
            >
              {changingPassword ? "Changing…" : "Change password"}
            </button>
            {passwordMessage && (
              <p
                className={`text-sm ${
                  passwordMessage.includes("successfully")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {passwordMessage}
              </p>
            )}
          </form>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-800">Low stock email alerts</h2>
        </div>
        <div className="p-5">
        <p className="mb-4 text-sm text-slate-600">
          When enabled, low-stock alerts can be sent to the email below (e.g. via
          a scheduled job or cron). Configure the recipient and enable alerts
          here; the{" "}
          <Link
            href="/admin"
            className="font-medium text-indigo-600 hover:text-indigo-700"
          >
            Dashboard
          </Link>{" "}
          always shows the current low-stock list.
        </p>
        <form onSubmit={save} className="flex flex-wrap items-end gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={lowStockAlertsEnabled}
              onChange={(e) => setLowStockAlertsEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-slate-700">
              Enable low-stock email alerts
            </span>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-500">
              Alert recipient email
            </span>
            <input
              type="email"
              placeholder="admin@example.com"
              className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={lowStockAlertEmail}
              onChange={(e) => setLowStockAlertEmail(e.target.value)}
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={sendTestAlert}
            disabled={sendingAlert}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
          >
            {sendingAlert ? "Sending…" : "Send test alert"}
          </button>
        </form>
        </div>
      </section>
    </main>
  );
}
