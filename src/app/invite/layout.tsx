import type { Metadata } from "next";
import { getInvitationDetails } from "@/lib/invitations";

type InviteLayoutProps = Readonly<{ children: React.ReactNode }>;
type InviteMetadataProps = { searchParams: Promise<{ from?: string; to?: string }> };

function safeName(value: string | undefined) {
  return value?.trim().slice(0, 80) || "";
}

export async function generateMetadata(
  { searchParams }: InviteMetadataProps = { searchParams: Promise.resolve({}) },
): Promise<Metadata> {
  const { from, to } = await (searchParams ?? Promise.resolve({}));
  const invitation = await getInvitationDetails(from).catch(() => null);
  const inviterName = invitation?.name || "Твій партнер";
  const recipientName = safeName(to);
  const title = recipientName
    ? `${inviterName} запрошує ${recipientName} до Love Notes`
    : `${inviterName} запрошує тебе до Love Notes`;
  const description = "Створіть ваш простір для теплих слів, спільних планів і важливих спогадів.";
  const params = new URLSearchParams();
  if (from?.trim()) params.set("from", from.trim());
  if (recipientName) params.set("to", recipientName);
  const imageUrl = `/invite/opengraph-image${params.size ? `?${params.toString()}` : ""}`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

export default function InviteLayout({ children }: InviteLayoutProps) {
  return children;
}
