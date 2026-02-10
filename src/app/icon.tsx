import { ImageResponse } from "next/og";

export function generateImageMetadata() {
  return [
    { id: "32", size: { width: 32, height: 32 }, contentType: "image/png" as const },
    { id: "192", size: { width: 192, height: 192 }, contentType: "image/png" as const },
    { id: "512", size: { width: 512, height: 512 }, contentType: "image/png" as const },
  ];
}

export default async function Icon({
  id,
}: {
  id: Promise<string>;
}) {
  const sizeId = await id;
  const size = sizeId === "32" ? 32 : sizeId === "192" ? 192 : 512;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          borderRadius: size >= 192 ? 24 : 6,
        }}
      >
        <div
          style={{
            fontSize: size * 0.5,
            color: "white",
            fontWeight: 700,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          S
        </div>
      </div>
    ),
    {
      width: size,
      height: size,
    }
  );
}
