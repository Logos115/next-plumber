"use client";

import { useCallback, useEffect, useState } from "react";
import QRCode from "qrcode";

type Props = { token: string; label: string };

export function BoxQRCode({ token, label }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  const generate = useCallback(async () => {
    const boxUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/b/${token}`
        : `/b/${token}`;
    try {
      const url = await QRCode.toDataURL(boxUrl, {
        width: 200,
        margin: 2,
      });
      setDataUrl(url);
    } catch (e) {
      console.error("QR generation failed:", e);
    }
  }, [token]);

  useEffect(() => {
    if (show && !dataUrl) generate();
  }, [show, dataUrl, generate]);

  async function download() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${label.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`;
    a.click();
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="text-sm text-indigo-600 hover:underline"
      >
        {show ? "Hide QR" : "Show QR"}
      </button>
      {show && (
        <div className="absolute left-0 top-full z-10 mt-2 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <div className="flex flex-col items-center gap-2">
            {dataUrl ? (
              <img src={dataUrl} alt={`QR for ${label}`} className="size-40" />
            ) : (
              <div className="flex size-40 items-center justify-center text-sm text-slate-500">
                Generating…
              </div>
            )}
            <a
              href={`/b/${token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:underline"
            >
              /b/{token}
            </a>
            <button
              type="button"
              onClick={download}
              disabled={!dataUrl}
              className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Download PNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
