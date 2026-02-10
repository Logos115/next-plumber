"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setDeferredPrompt(null);
  };

  if (!mounted) return null;

  // Browser gave us the install prompt — show Install button
  if (deferredPrompt) {
    return (
      <button
        type="button"
        onClick={handleInstall}
        className="rounded-xl border-2 border-slate-800 dark:border-slate-200 text-slate-800 dark:text-slate-200 px-6 py-3 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        Install app
      </button>
    );
  }

  // No prompt — show workaround (install is often hidden on managed Chrome)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 text-left text-sm text-slate-600 dark:text-slate-400 max-w-md">
      <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">Open as app</p>
      <p className="mb-2">
        If &quot;Install app&quot; is not in the ⋮ menu (e.g. on managed Chrome), use this instead:
      </p>
      <p className="mb-0">
        <strong>⋮ menu → More tools → Create shortcut…</strong> → check &quot;Open as window&quot; → OK. The app will open in its own window like an installed app.
      </p>
    </div>
  );
}
