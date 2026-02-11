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
        className="rounded-xl border-2 border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 px-6 py-3 font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
      >
        Install app
      </button>
    );
  }

  // No prompt — show workaround (install is often hidden on managed Chrome)
  return (
    <InstallInstructions />
  );
}

function InstallInstructions() {
  // Default to mobile (engineer page is typically used on phones)
  const [device, setDevice] = useState<"ios" | "android" | "desktop">("android");

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) {
      setDevice("ios");
    } else if (/Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      setDevice("android");
    } else {
      setDevice("desktop");
    }
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-600 bg-white/80 dark:bg-slate-800/50 px-4 py-3 text-left text-sm text-slate-600 dark:text-slate-400 max-w-md shadow-sm">
      <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">Open as app</p>
      {device === "ios" ? (
        <p className="mb-0">
          Tap the <strong>Share</strong> button (□↑) → <strong>Add to Home Screen</strong>. The app will appear on your home screen.
        </p>
      ) : device === "android" ? (
        <p className="mb-0">
          Tap <strong>⋮ menu</strong> (top right) → <strong>Add to Home screen</strong> or <strong>Install app</strong>. The app will appear on your home screen.
        </p>
      ) : (
        <>
          <p className="mb-2">
            <strong>⋮ menu</strong> → <strong>Cast, save, and share</strong> → <strong>Create shortcut…</strong>
          </p>
          <p className="mb-0 text-slate-500 dark:text-slate-400">
            If the dialog has an &quot;Open as window&quot; checkbox, check it for an app-like window.
          </p>
        </>
      )}
    </div>
  );
}
