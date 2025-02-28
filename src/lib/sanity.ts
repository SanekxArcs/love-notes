// lib/sanity.ts
import { createClient } from "next-sanity";

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2023-05-03",
  useCdn: false, // Set to false for mutations
  token: process.env.SANITY_API_TOKEN,
});

export async function getTodayMessage(userId: string) {
  // Get today's date at midnight
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // First check if the user already has a message for today
  const existingMessage = await sanityClient.fetch(
    `
    *[_type == "userMessageHistory" && 
      userId == $userId && 
      shownAt >= $today && 
      isExtraMessage == false][0] {
      _id,
      shownAt,
      "message": messageId->{
        _id,
        text
      }
    }
  `,
    { userId, today: today.toISOString() }
  );

  if (existingMessage) {
    return existingMessage.message;
  }

  // If no message exists, get a random unshown message
  const randomMessage = await sanityClient.fetch(`
    *[_type == "message" && category == "daily" && !isShown][0...10] | order(rand())[0] {
      _id,
      text
    }
  `);

  if (randomMessage) {
    // Create history record
    await sanityClient.create({
      _type: "userMessageHistory",
      userId,
      messageId: {
        _ref: randomMessage._id,
        _type: "reference",
      },
      shownAt: new Date().toISOString(),
      isExtraMessage: false,
    });

    // Update message as shown
    await sanityClient
      .patch(randomMessage._id)
      .set({
        isShown: true,
        lastShownAt: new Date().toISOString(),
      })
      .commit();
  }

  return randomMessage;
}

export async function getExtraMessage(userId: string) {
  // Get a random unshown extra message
  const randomMessage = await sanityClient.fetch(`
    *[_type == "message" && category == "extra" && !isShown][0...10] | order(rand())[0] {
      _id,
      text
    }
  `);

  if (randomMessage) {
    // Create history record
    await sanityClient.create({
      _type: "userMessageHistory",
      userId,
      messageId: {
        _ref: randomMessage._id,
        _type: "reference",
      },
      shownAt: new Date().toISOString(),
      isExtraMessage: true,
    });

    // Update message as shown
    await sanityClient
      .patch(randomMessage._id)
      .set({
        isShown: true,
        lastShownAt: new Date().toISOString(),
      })
      .commit();
  }

  return randomMessage;
}

export async function getMessageHistory(userId: string, limit = 20) {
  return sanityClient.fetch(
    `
    *[_type == "userMessageHistory" && userId == $userId] | order(shownAt desc)[0...$limit] {
      _id,
      shownAt,
      isExtraMessage,
      "message": messageId->{
        _id,
        text
      }
    }
  `,
    { userId, limit }
  );
}

export async function getSettings() {
  try {
    return await sanityClient.fetch(`*[_type == "settings"][0]`);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
}