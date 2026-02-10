import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "Stock & Box Logging",
  description: "Log stock usage from boxes via QR or link. For field engineers.",
  manifest: "/manifest",
  appleWebApp: {
    capable: true,
    title: "Stock Box",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default function PwaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
