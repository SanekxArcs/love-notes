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
      description: "The date and time this message was shown",
    }),
    defineField({
      name: "creator",
      title: "Creator",
      type: "reference",
      description:
        "The user who created this message (required for tracking and batch operations)",
      to: [{ type: "user" }],
      validation: (Rule) =>
        Rule.required().error("Creator is required to track message ownership"),
      options: {
        disableNew: true,
      },
    }),
    defineField({
      name: "shownBy",
      title: "Shown By",
      type: "reference",
      description: "The user who received this message",
      to: [{ type: "user" }],
      options: {
        disableNew: true,
      },
    }),
  ],
  preview: {
    select: {
      text: "text",
      category: "category",
      like: "like",
      userName: "userName",
    },
    prepare({ text, category, like, userName }) {
      const truncatedText =
        text && text.length > 30 ? text.substring(0, 30) + "..." : text;
      const likeStatus = like ? "❤️" : "🤍";
      const shown = userName ? ` ${userName}` : "❔";
      const categoryShow =
        category === "daily" ? "📅" : category === "extra" ? "🎁" : "❓";

      return {
        title: truncatedText,
        subtitle: `${likeStatus} | ${shown} | ${categoryShow} `,
      };
    },
  },
});
