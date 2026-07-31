import { defineField, defineType } from "sanity";
import { UserIcon } from "@sanity/icons/User";

export const userType = defineType({
  name: "user",
  title: "Users",
  type: "document",
  icon: UserIcon,
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      description: "Profile image of the user",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      description: "Full name of the user",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "login",
      title: "Login",
      type: "string",
      description: "Username for login",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "password",
      title: "Password",
      type: "string",
      description: "User password (stored in plaintext for now)",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description: "User role determines permissions",
      options: {
        list: [
          { title: "User", value: "user" },
          { title: "Admin", value: "admin" },
        ],
      },
      initialValue: "user",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "partnerIdToSend",
      title: "Partner ID to Send Messages",
      type: "string",
      initialValue: crypto.randomUUID(),
      description:
        "ID of the partner to send messages to. you can customize it",
    }),
    defineField({
      name: "phone",
      title: "Phone Number",
      type: "string",
      description: "Phone number of the user (optional)",
    }),
    defineField({
      name: "dayMessageLimit",
      title: "Day Message Limit",
      type: "number",
      description: "Number of messages user can send in a day",
      initialValue: 2,
    }),
    defineField({
      name: "partnerIdToReceiveFrom",
      title: "Partner ID to Receive Messages From",
      type: "string",
      description: "ID of the partner who can send messages to you",
    }),
    defineField({
      name: "messages",
      title: "Messages",
      type: "array",
      of: [{ type: "message" }],
      description: "Messages authored by this user",
    }),
    defineField({
      name: "geminiApiKey",
      title: "Gemini API Key",
      type: "string",
      description: "Google Gemini API key, used to generate AI message suggestions",
    }),
    defineField({
      name: "partnerInfo",
      title: "Partner Info (for AI)",
      type: "text",
      description:
        "Free-text info about your partner (interests, inside jokes, how you met, etc.) used to personalize AI-generated messages",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "login",
      role: "role",
      messages: "messages",
    },
    prepare({ title, subtitle, role, messages }) {
      const count = Array.isArray(messages) ? messages.length : 0;
      return {
        title: title || "Unnamed User",
        subtitle: `${subtitle} (${role}) · ${count} message${count === 1 ? "" : "s"}`,
      };
    },
  },
});
