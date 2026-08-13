import { sanityClient } from "@/lib/sanity";

export type LiveUser = {
  _id: string;
  _rev?: string;
  name?: string;
  login?: string;
  role?: string;
  lastActiveAt?: string;
  partnerIdToSend?: string;
  partnerIdToReceiveFrom?: string;
};

export type ConnectedPartner = {
  _id: string;
  _rev?: string;
  name?: string;
  phone?: string;
  dayMessageLimit?: number;
  partnerIdToSend?: string;
  partnerIdToReceiveFrom?: string;
};

export async function getLiveUser(userId: string) {
  return sanityClient.fetch<LiveUser | null>(
    `*[_type == "user" && _id == $userId][0]{
      _id, _rev, name, login, role, lastActiveAt,
      partnerIdToSend, partnerIdToReceiveFrom
    }`,
    { userId },
  );
}

export async function getConnectedPartner(userId: string) {
  const result = await sanityClient.fetch<{
    user: LiveUser | null;
    partner: ConnectedPartner | null;
  }>(
    `{
      "user": *[_type == "user" && _id == $userId][0]{
        _id, _rev, name, login, role, lastActiveAt,
        partnerIdToSend, partnerIdToReceiveFrom
      },
      "partner": *[
        _type == "user" &&
        partnerIdToSend == *[_type == "user" && _id == $userId][0].partnerIdToReceiveFrom
      ][0]{
        _id, _rev, name, phone, dayMessageLimit,
        partnerIdToSend, partnerIdToReceiveFrom
      }
    }`,
    { userId },
  );

  const reciprocal =
    result.partner?.partnerIdToReceiveFrom?.trim() ===
    result.user?.partnerIdToSend?.trim();
  return {
    user: result.user,
    partner: reciprocal ? result.partner : null,
  };
}

export async function connectPartner(userId: string, partnerId: string) {
  const user = await getLiveUser(userId);
  if (!user?._rev || !user.partnerIdToSend) {
    return { ok: false as const, reason: "user-not-found" as const };
  }

  const normalizedPartnerId = partnerId.trim();
  const partner = await sanityClient.fetch<ConnectedPartner | null>(
    `*[_type == "user" && partnerIdToSend == $partnerId][0]{
      _id, _rev, partnerIdToSend, partnerIdToReceiveFrom
    }`,
    { partnerId: normalizedPartnerId },
  );
  if (!partner?._rev || partner._id === userId) {
    return { ok: false as const, reason: "partner-not-found" as const };
  }

  const partnerConnection = partner.partnerIdToReceiveFrom?.trim();
  if (partnerConnection && partnerConnection !== user.partnerIdToSend) {
    return { ok: false as const, reason: "partner-already-connected" as const };
  }

  const oldPartner = user.partnerIdToReceiveFrom
    ? await sanityClient.fetch<ConnectedPartner | null>(
        `*[_type == "user" && partnerIdToSend == $partnerId][0]{
          _id, _rev, partnerIdToReceiveFrom
        }`,
        { partnerId: user.partnerIdToReceiveFrom },
      )
    : null;

  const transaction = sanityClient.transaction();
  transaction.patch(user._id, (patch) =>
    patch
      .ifRevisionId(user._rev as string)
      .set({ partnerIdToReceiveFrom: normalizedPartnerId }),
  );
  transaction.patch(partner._id, (patch) =>
    patch
      .ifRevisionId(partner._rev as string)
      .set({ partnerIdToReceiveFrom: user.partnerIdToSend }),
  );
  if (
    oldPartner?._rev &&
    oldPartner._id !== partner._id &&
    oldPartner.partnerIdToReceiveFrom === user.partnerIdToSend
  ) {
    transaction.patch(oldPartner._id, (patch) =>
      patch
        .ifRevisionId(oldPartner._rev as string)
        .unset(["partnerIdToReceiveFrom"]),
    );
  }
  await transaction.commit();
  return { ok: true as const };
}

export async function disconnectPartner(userId: string) {
  const user = await getLiveUser(userId);
  if (!user?._rev) return false;

  const partner = user.partnerIdToReceiveFrom
    ? await sanityClient.fetch<ConnectedPartner | null>(
        `*[_type == "user" && partnerIdToSend == $partnerId][0]{
          _id, _rev, partnerIdToReceiveFrom
        }`,
        { partnerId: user.partnerIdToReceiveFrom },
      )
    : null;

  const transaction = sanityClient.transaction();
  transaction.patch(user._id, (patch) =>
    patch.ifRevisionId(user._rev as string).unset(["partnerIdToReceiveFrom"]),
  );
  if (
    partner?._rev &&
    partner.partnerIdToReceiveFrom === user.partnerIdToSend
  ) {
    transaction.patch(partner._id, (patch) =>
      patch
        .ifRevisionId(partner._rev as string)
        .unset(["partnerIdToReceiveFrom"]),
    );
  }
  await transaction.commit();
  return true;
}

export async function rotateOutgoingPartnerId(userId: string, nextPartnerId: string) {
  const user = await getLiveUser(userId);
  if (!user?._rev || !user.partnerIdToSend) {
    return { ok: false as const, reason: "user-not-found" as const };
  }
  if (nextPartnerId === user.partnerIdToSend) return { ok: true as const };

  const duplicate = await sanityClient.fetch<string | null>(
    `*[_type == "user" && partnerIdToSend == $partnerId && _id != $userId][0]._id`,
    { partnerId: nextPartnerId, userId },
  );
  if (duplicate) {
    return { ok: false as const, reason: "duplicate" as const };
  }

  const partner = user.partnerIdToReceiveFrom
    ? await sanityClient.fetch<ConnectedPartner | null>(
        `*[_type == "user" && partnerIdToSend == $partnerId][0]{
          _id, _rev, partnerIdToReceiveFrom
        }`,
        { partnerId: user.partnerIdToReceiveFrom },
      )
    : null;

  const transaction = sanityClient.transaction();
  transaction.patch(user._id, (patch) =>
    patch
      .ifRevisionId(user._rev as string)
      .set({ partnerIdToSend: nextPartnerId }),
  );
  if (
    partner?._rev &&
    partner.partnerIdToReceiveFrom === user.partnerIdToSend
  ) {
    transaction.patch(partner._id, (patch) =>
      patch
        .ifRevisionId(partner._rev as string)
        .set({ partnerIdToReceiveFrom: nextPartnerId }),
    );
  }
  await transaction.commit();
  return { ok: true as const };
}

export function isValidArrayKey(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length <= 128 &&
    /^[A-Za-z0-9_-]+$/.test(value)
  );
}
