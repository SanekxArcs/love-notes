import { sanityClient } from "@/lib/sanity";

type UserForDeletion = {
  _id: string;
  partnerIdToSend?: string;
};

type MessageReferenceOwner = {
  _id: string;
  messageKeys: string[];
};

export async function deleteUserAndRelatedData(userId: string) {
  const user = await sanityClient.fetch<UserForDeletion | null>(
    `*[_type == "user" && _id == $userId][0]{ _id, partnerIdToSend }`,
    { userId },
  );
  if (!user) return false;

  const [linkedUsers, history, referenceOwners] = await Promise.all([
    user.partnerIdToSend
      ? sanityClient.fetch<Array<{ _id: string }>>(
          `*[_type == "user" && partnerIdToReceiveFrom == $partnerId]{ _id }`,
          { partnerId: user.partnerIdToSend },
        )
      : [],
    sanityClient.fetch<Array<{ _id: string }>>(
      `*[_type == "userMessageHistory" && userId == $userId]{ _id }`,
      { userId },
    ),
    sanityClient.fetch<MessageReferenceOwner[]>(
      `*[_type == "user" && count(messages[shownBy._ref == $userId]) > 0]{
        _id,
        "messageKeys": messages[shownBy._ref == $userId]._key
      }`,
      { userId },
    ),
  ]);

  const transaction = sanityClient.transaction();
  for (const linkedUser of linkedUsers) {
    transaction.patch(linkedUser._id, (patch) =>
      patch.unset(["partnerIdToReceiveFrom"]),
    );
  }
  for (const owner of referenceOwners) {
    transaction.patch(owner._id, (patch) =>
      patch.unset(
        owner.messageKeys.map(
          (key) => `messages[_key=="${key}"].shownBy`,
        ),
      ),
    );
  }
  for (const item of history) transaction.delete(item._id);
  transaction.delete(userId);
  await transaction.commit();
  return true;
}
