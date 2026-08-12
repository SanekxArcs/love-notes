import { sanityClient } from "@/lib/sanity";

export interface InvitationDetails {
  name: string;
}

export async function getInvitationDetails(partnerId: string | undefined) {
  const normalizedPartnerId = partnerId?.trim();
  if (!normalizedPartnerId) return null;

  const invitation = await sanityClient.fetch<{ name?: string } | null>(
    '*[_type == "user" && partnerIdToSend == $partnerId][0]{ name }',
    { partnerId: normalizedPartnerId },
  );

  if (!invitation) return null;
  return { name: invitation.name?.trim() || "Твій партнер" } satisfies InvitationDetails;
}
