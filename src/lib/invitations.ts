import { unstable_cache } from "next/cache";
import { sanityClient } from "@/lib/sanity";

export interface InvitationDetails {
  name: string;
}

const findInvitation = unstable_cache(
  async (partnerId: string) => {
    return sanityClient.fetch<{ name?: string } | null>(
      '*[_type == "user" && partnerIdToSend == $partnerId][0]{ name }',
      { partnerId },
    );
  },
  ["invitation-details"],
  { revalidate: 300 },
);

export async function getInvitationDetails(partnerId: string | undefined) {
  const normalizedPartnerId = partnerId?.trim();
  if (!normalizedPartnerId) return null;

  const invitation = await findInvitation(normalizedPartnerId);

  if (!invitation) return null;
  return { name: invitation.name?.trim() || "Твій партнер" } satisfies InvitationDetails;
}
