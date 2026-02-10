"use client";

import { useEffect } from "react";

export function RegisterSw() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .then(() => {})
      .catch(() => {});
  }, []);
  return null;
}
