// Minimal service worker so the PWA meets installability criteria (Chrome).
self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", () => {
  // No-op: pass through to network. Required for install prompt in some browsers.
});
