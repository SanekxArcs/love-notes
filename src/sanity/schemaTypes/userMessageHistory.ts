import { defineField, defineType } from "sanity";
import { TaskIcon } from "@sanity/icons";

export const userMessageHistoryType = defineType({
  name: "userMessageHistory",
  title: "User Message History",
  type: "document",
    icon: TaskIcon,
  fields: [
    defineField({
      name: "userId",
      title: "User ID",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "messageId",
      title: "Message ID",
      type: "reference",
      to: [{ type: "message" }],
    }),
    defineField({
      name: "text",
      title: "Message Text",
      type: "text",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Message Type",
      type: "string",
      initialValue: "daily",
      options: {
        layout: "radio",
        list: [
          { title: "Unknown", value: "unknown" },
          { title: "Daily Message", value: "daily" },
          { title: "Extra Message", value: "extra" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "isShown",
      title: "Has Been Shown",
      type: "boolean",
      initialValue: false,
    }),
    //like or not
    defineField({
      name: "like",
      title: "Like",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "lastShownAt",
      title: "Last Shown At",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      text: "text",
      category: "category",
      like: "like",
      isShown: "isShown",
    },
    prepare({ text, category, like, isShown }) {
      const truncatedText =
        text && text.length > 30 ? text.substring(0, 30) + "..." : text;
      const likeStatus = like ? "❤️ Liked" : "🤍 Not liked";
      const shown = isShown ? "Вже побачила" : "Ще ні";

      return {
        title: truncatedText,
        subtitle: `${likeStatus} | ${shown} | Category: ${category}`,
      };
    },
  },
});
