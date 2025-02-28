import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const messageType = defineType({
  name: "message",
  title: "Love Messages",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "text",
      title: "Message Text",
      type: "text",
      description: "The text of the message, limit 500 symbols",
      validation: (Rule) => Rule.required(),
    }),
    
    defineField({
      name: "isShown",
      title: "Has Been Shown",
      type: "boolean",
      description: "Whether this message has been shown to the user",
      initialValue: false,
    }),
    defineField({
      name: "userName",
      title: "User Name",
      type: "string",
      description: "The user name who received this message",
    }),
    defineField({
      name: "category",
      title: "Message Type",
      type: "string",
      description: "The type of message",
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
      name: "like",
      title: "Like",
      type: "boolean",
      description: "Whether the user liked this message",
      initialValue: false,
    }),
    defineField({
      name: "shownAt",
      title: "Shown At",
      type: "datetime",
      description: "The date and time this message was shown"
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
