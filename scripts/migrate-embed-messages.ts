// One-time migration: copy standalone `message` documents into their author's
// `user.messages` array as embedded objects, then (only when explicitly asked)
// delete the original `message` documents.
//
// Usage:
//   1. Dry run / migrate:  npx tsx --env-file=.env scripts/migrate-embed-messages.ts
//   2. Verify the data in Studio (open each user, check their embedded messages).
//   3. Only once you're confident the data is correct, delete the originals:
//      npx tsx --env-file=.env scripts/migrate-embed-messages.ts --delete-originals
//      Add --user="<name>" to scope the delete to a single user (e.g. a test account)
//      instead of deleting every migrated message document.
//
// Requires a write-enabled token (SANITY_API_TOKEN or SANITY_API_DEV_TOKEN), plus
// NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET.

import { createClient } from "next-sanity";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03",
  useCdn: false,
  token: process.env.SANITY_API_TOKEN || process.env.SANITY_API_DEV_TOKEN,
});

const shouldDeleteOriginals = process.argv.includes("--delete-originals");
const userFilterArg = process.argv.find((arg) => arg.startsWith("--user="));
const userNameFilter = userFilterArg?.slice("--user=".length).replace(/^["']|["']$/g, "");

interface OldMessage {
  _id: string;
  _createdAt: string;
  text: string;
  isShown?: boolean;
  userName?: string;
  category?: string;
  like?: boolean;
  shownAt?: string | null;
  creatorId?: string;
  shownById?: string;
}

async function main() {
  const oldMessages: OldMessage[] = await client.fetch(
    `*[_type == "message"]{
      _id,
      _createdAt,
      text,
      isShown,
      userName,
      category,
      like,
      shownAt,
      "creatorId": creator._ref,
      "shownById": shownBy._ref
    }`
  );

  console.log(`Found ${oldMessages.length} standalone message document(s).`);

  const byCreator = new Map<string, OldMessage[]>();
  const orphaned: OldMessage[] = [];

  for (const message of oldMessages) {
    if (!message.creatorId) {
      orphaned.push(message);
      continue;
    }
    const group = byCreator.get(message.creatorId) ?? [];
    group.push(message);
    byCreator.set(message.creatorId, group);
  }

  if (orphaned.length > 0) {
    console.warn(
      `Skipping ${orphaned.length} message(s) with no creator reference (not migrated, not deleted):`,
      orphaned.map((m) => m._id)
    );
  }

  if (!shouldDeleteOriginals) {
    for (const [userId, messages] of byCreator) {
      const user = await client.fetch<{ name?: string }>(
        `*[_type == "user" && _id == $userId][0]{ name }`,
        { userId }
      );

      const embedded = messages.map((m) => ({
        _type: "message" as const,
        _key: crypto.randomUUID(),
        text: m.text,
        isShown: m.isShown ?? false,
        userName: m.userName,
        category: m.category ?? "unknown",
        like: m.like ?? false,
        shownAt: m.shownAt ?? null,
        createdAt: m._createdAt,
        ...(m.shownById
          ? { shownBy: { _type: "reference" as const, _ref: m.shownById } }
          : {}),
      }));

      console.log(`- ${user?.name ?? userId}: embedding ${embedded.length} message(s)`);

      await client.patch(userId).set({ messages: embedded }).commit();
    }

    console.log(
      "\nMigration complete. Verify the data in Studio, then re-run with --delete-originals to remove the old message documents."
    );
    return;
  }

  let targetUserId: string | undefined;
  if (userNameFilter) {
    targetUserId = await client.fetch<string | undefined>(
      `*[_type == "user" && name == $name][0]._id`,
      { name: userNameFilter }
    );
    if (!targetUserId) {
      console.error(`No user found with name "${userNameFilter}". Nothing deleted.`);
      return;
    }
    console.log(`\nScoping delete to user "${userNameFilter}" (${targetUserId}).`);
  }

  const idsToDelete = oldMessages
    .filter((m) => m.creatorId)
    .filter((m) => !targetUserId || m.creatorId === targetUserId)
    .map((m) => m._id);

  console.log(`Deleting ${idsToDelete.length} migrated message document(s)...`);

  const transaction = client.transaction();
  idsToDelete.forEach((id) => transaction.delete(id));
  await transaction.commit();

  console.log(`Deleted ${idsToDelete.length} message document(s).`);
  if (!targetUserId && orphaned.length > 0) {
    console.log(
      `${orphaned.length} orphaned message(s) were left untouched (no creator to confirm migration against):`,
      orphaned.map((m) => m._id)
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
