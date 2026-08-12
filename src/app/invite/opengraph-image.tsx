import { ImageResponse } from "next/og";
import { getInvitationDetails } from "@/lib/invitations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Запрошення до Love Notes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function safeName(value: string | undefined) {
  return value?.trim().slice(0, 80) || "";
}

export default async function InviteOpenGraphImage({
  searchParams,
}: {
  searchParams?: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await (searchParams ?? Promise.resolve<{ from?: string; to?: string }>({}));
  const invitation = await getInvitationDetails(from).catch(() => null);
  const inviterName = invitation?.name || "Твій партнер";
  const recipientName = safeName(to);
  const greeting = recipientName ? `${recipientName}, тебе запрошують` : "Тебе запрошують";

  return new ImageResponse(
    (
      <div style={{ height: "100%", width: "100%", display: "flex", position: "relative", overflow: "hidden", background: "linear-gradient(135deg, #fff4fa 0%, #f9d5e8 46%, #d8c7fa 100%)", color: "#351726", fontFamily: "sans-serif" }}>
        <div style={{ position: "absolute", width: 620, height: 620, borderRadius: 9999, right: -170, top: -150, background: "radial-gradient(circle at 30% 30%, #ffe9f4 0%, #f477b0 45%, #bd5baf 100%)", opacity: 0.95 }} />
        <div style={{ position: "absolute", width: 430, height: 430, borderRadius: 9999, right: 90, bottom: -210, background: "radial-gradient(circle at 42% 35%, #fff5fb 0%, #e8539a 55%, #a94fbb 100%)", opacity: 0.88 }} />
        <div style={{ position: "absolute", width: 132, height: 132, borderRadius: 9999, right: 180, top: 88, background: "rgba(255,255,255,.72)", border: "8px solid rgba(255,255,255,.5)", boxShadow: "0 18px 38px rgba(118,32,91,.18)" }} />
        <div style={{ position: "absolute", width: 58, height: 58, borderRadius: 9999, right: 116, top: 236, background: "rgba(255,255,255,.7)", border: "4px solid rgba(255,255,255,.42)" }} />
        <div style={{ position: "absolute", width: 44, height: 44, borderRadius: 9999, right: 420, bottom: 94, background: "rgba(255,255,255,.65)" }} />
        <div style={{ position: "absolute", right: 206, top: 226, width: 230, height: 205, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-8deg)", color: "#fff", fontSize: 164, textShadow: "0 15px 35px rgba(115,29,91,.25)" }}>♥</div>
        <div style={{ zIndex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "72px 64px", width: 760 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#d52d79", fontSize: 24, fontWeight: 700, letterSpacing: 2 }}>
            <span style={{ display: "flex", width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", background: "linear-gradient(145deg, #ff82b7, #df367a)", color: "white", fontSize: 25 }}>♥</span>
            LOVE NOTES
          </div>
          <div style={{ display: "flex", marginTop: 42, fontSize: 38, fontWeight: 600, color: "#7a3b5e" }}>{greeting}</div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 66, lineHeight: 1.05, fontWeight: 800, letterSpacing: -2 }}>{inviterName}</div>
          <div style={{ display: "flex", marginTop: 18, width: 585, fontSize: 29, lineHeight: 1.35, color: "#6a4b5d" }}>хоче створити з тобою простір для теплих слів і важливих спогадів.</div>
          <div style={{ display: "flex", marginTop: 32, fontSize: 24, fontWeight: 700, color: "#d52d79" }}>Ваш простір для двох</div>
        </div>
      </div>
    ),
    size,
  );
}
