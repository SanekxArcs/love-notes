import { sanityClient } from "@/lib/sanity";

export const EMPTY_ACCOUNT_RETENTION_DAYS = 14;
export const INACTIVE_ACCOUNT_RETENTION_DAYS = 90;

type AdminMessage = { isShown?: boolean };

type AdminUserRecord = {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  name?: string;
  login?: string;
  role?: string;
  partnerIdToSend?: string;
  partnerIdToReceiveFrom?: string;
  lastActiveAt?: string;
  partnerInfo?: string;
  geminiApiKey?: string;
  messages?: AdminMessage[];
  partnerNotes?: unknown[];
  calendarEvents?: unknown[];
};

export type AdminUser = {
  id: string;
  name: string;
  login: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string | null;
  isConnected: boolean;
  messageCount: number;
  shownMessageCount: number;
  noteCount: number;
  calendarEventCount: number;
  hasGeminiKey: boolean;
  hasContent: boolean;
  isEmpty: boolean;
  emptyAccountEligible: boolean;
  inactiveAccountEligible: boolean;
  canDelete: boolean;
  deletionReason: "empty-14-days" | "inactive-90-days" | null;
};

export type AdminMetrics = {
  userCount: number;
  coupleCount: number;
  connectedUserCount: number;
  messageCount: number;
  shownMessageCount: number;
  noteCount: number;
  calendarEventCount: number;
  activeUserCount: number;
  inactiveUserCount: number;
  emptyAccountCount: number;
  cleanupEligibleCount: number;
  geminiUserCount: number;
  adminCount: number;
};

const retentionDate = (days: number, from: string) => {
  const date = new Date(from);
  date.setDate(date.getDate() + days);
  return date;
};

const getLastActivity = (user: AdminUserRecord) =>
  user.lastActiveAt || user._updatedAt || user._createdAt;

async function fetchAdminUsers() {
  return sanityClient.fetch<AdminUserRecord[]>(
    `*[_type == "user"] | order(_createdAt desc){
      _id, _createdAt, _updatedAt, name, login, role,
      partnerIdToSend, partnerIdToReceiveFrom, lastActiveAt,
      partnerInfo, geminiApiKey, messages, partnerNotes, calendarEvents
    }`,
  );
}

function mapAdminUser(
  user: AdminUserRecord,
  connectedInviteIds: Set<string>,
  now: Date,
): AdminUser {
  const messages = Array.isArray(user.messages) ? user.messages : [];
  const messageCount = messages.length;
  const shownMessageCount = messages.filter((message) => message.isShown).length;
  const noteCount = Array.isArray(user.partnerNotes) ? user.partnerNotes.length : 0;
  const calendarEventCount = Array.isArray(user.calendarEvents)
    ? user.calendarEvents.length
    : 0;
  const hasGeminiKey = Boolean(user.geminiApiKey?.trim());
  const hasContent = Boolean(
    messageCount ||
      noteCount ||
      calendarEventCount ||
      user.partnerInfo?.trim() ||
      hasGeminiKey,
  );
  const isEmpty = !hasContent;
  const isConnected = Boolean(
    user.partnerIdToReceiveFrom?.trim() ||
      (user.partnerIdToSend && connectedInviteIds.has(user.partnerIdToSend)),
  );
  const emptyAccountEligible =
    isEmpty &&
    !isConnected &&
    retentionDate(EMPTY_ACCOUNT_RETENTION_DAYS, user._createdAt) <= now;
  const inactiveAccountEligible =
    !isConnected &&
    retentionDate(INACTIVE_ACCOUNT_RETENTION_DAYS, getLastActivity(user)) <= now;
  const deletionReason = emptyAccountEligible
    ? "empty-14-days"
    : inactiveAccountEligible
      ? "inactive-90-days"
      : null;

  return {
    id: user._id,
    name: user.name || "Без імені",
    login: user.login || "Без логіну",
    role: user.role || "user",
    createdAt: user._createdAt,
    updatedAt: user._updatedAt,
    lastActiveAt: user.lastActiveAt || null,
    isConnected,
    messageCount,
    shownMessageCount,
    noteCount,
    calendarEventCount,
    hasGeminiKey,
    hasContent,
    isEmpty,
    emptyAccountEligible,
    inactiveAccountEligible,
    canDelete: Boolean(deletionReason) && user.role !== "admin",
    deletionReason,
  };
}

function connectedInviteIds(users: AdminUserRecord[]) {
  return new Set(
    users
      .map((user) => user.partnerIdToReceiveFrom?.trim())
      .filter((value): value is string => Boolean(value)),
  );
}

function coupleCount(users: AdminUserRecord[]) {
  const pairs = new Set(
    users
      .filter((user) => user.partnerIdToReceiveFrom?.trim())
      .map((user) => {
        const sender = users.find(
          (candidate) => candidate.partnerIdToSend === user.partnerIdToReceiveFrom,
        );
        return sender
          ? [sender._id, user._id].sort().join(":")
          : user.partnerIdToReceiveFrom;
      }),
  );
  return pairs.size;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const users = await fetchAdminUsers();
  const now = new Date();
  const inviteIds = connectedInviteIds(users);
  return users.map((user) => mapAdminUser(user, inviteIds, now));
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const rawUsers = await fetchAdminUsers();
  const now = new Date();
  const inviteIds = connectedInviteIds(rawUsers);
  const users = rawUsers.map((user) => mapAdminUser(user, inviteIds, now));
  const activeCutoff = new Date(now);
  activeCutoff.setDate(activeCutoff.getDate() - 30);
  const inactiveCutoff = new Date(now);
  inactiveCutoff.setDate(
    inactiveCutoff.getDate() - INACTIVE_ACCOUNT_RETENTION_DAYS,
  );

  return {
    userCount: users.length,
    coupleCount: coupleCount(rawUsers),
    connectedUserCount: users.filter((user) => user.isConnected).length,
    messageCount: users.reduce((total, user) => total + user.messageCount, 0),
    shownMessageCount: users.reduce(
      (total, user) => total + user.shownMessageCount,
      0,
    ),
    noteCount: users.reduce((total, user) => total + user.noteCount, 0),
    calendarEventCount: users.reduce(
      (total, user) => total + user.calendarEventCount,
      0,
    ),
    activeUserCount: users.filter(
      (user) => new Date(user.lastActiveAt || user.updatedAt) >= activeCutoff,
    ).length,
    inactiveUserCount: users.filter(
      (user) => new Date(user.lastActiveAt || user.updatedAt) < inactiveCutoff,
    ).length,
    emptyAccountCount: users.filter(
      (user) => user.isEmpty && !user.isConnected,
    ).length,
    cleanupEligibleCount: users.filter((user) => user.canDelete).length,
    geminiUserCount: users.filter((user) => user.hasGeminiKey).length,
    adminCount: users.filter((user) => user.role === "admin").length,
  };
}

export async function getAdminUserForDeletion(userId: string) {
  const users = await fetchAdminUsers();
  const target = users.find((user) => user._id === userId);
  if (!target) return null;

  return {
    target,
    mapped: mapAdminUser(target, connectedInviteIds(users), new Date()),
  };
}
