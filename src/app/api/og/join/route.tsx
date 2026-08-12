import { ImageResponse } from "next/og";

export const runtime = "nodejs";

function cleanText(value: string | null, fallback: string, limit: number) {
  const text = value?.trim().replace(/\s+/g, " ");
  return text ? text.slice(0, limit) : fallback;
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = cleanText(searchParams.get("title"), "Створіть ваш простір для двох", 90);
  const message = cleanText(searchParams.get("message"), "Теплі слова, спільні плани та важливі спогади.", 130);

  return new ImageResponse(
    <div style={{ height: "100%", width: "100%", display: "flex", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #fff4fa 0%, #f9d5e8 46%, #d8c7fa 100%)", color: "#351726", fontFamily: "sans-serif" }}>
      <div style={{ position: "absolute", width: 620, height: 620, borderRadius: 9999, right: -170, top: -150, background: "radial-gradient(circle at 30% 30%, #ffe9f4 0%, #f477b0 45%, #bd5baf 100%)" }} />
      <div style={{ position: "absolute", width: 430, height: 430, borderRadius: 9999, right: 90, bottom: -210, background: "radial-gradient(circle at 42% 35%, #fff5fb 0%, #e8539a 55%, #a94fbb 100%)" }} />
      <div style={{ position: "absolute", right: 210, top: 205, width: 230, height: 205, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-8deg)", color: "#fff", fontSize: 178, textShadow: "0 15px 35px rgba(115,29,91,.25)" }}>♥</div>
      <div style={{ zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "72px 64px", width: 760 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#d52d79", fontSize: 24, fontWeight: 700, letterSpacing: 2 }}><span style={{ display: "flex", width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg, #ff82b7, #df367a)", color: "white", fontSize: 25 }}>♥</span>LOVE NOTES</div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 65, lineHeight: 1.05, fontWeight: 800, letterSpacing: -2 }}>{title}</div>
        <div style={{ display: "flex", marginTop: 24, width: 590, fontSize: 29, lineHeight: 1.35, color: "#6a4b5d" }}>{message}</div>
        <div style={{ display: "flex", marginTop: 34, fontSize: 24, fontWeight: 700, color: "#d52d79" }}>Ваш простір для двох</div>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
