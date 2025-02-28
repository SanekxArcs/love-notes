import { defineField, defineType } from "sanity";
import { WrenchIcon } from "@sanity/icons";


export const settingsType = defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  icon: WrenchIcon,
  liveEdit: true,
  fields: [
    defineField({
      name: "contactNumber",
      title: "Contact Phone Number",
      type: "string",
    }),
    defineField({
      name: "dailyMessageLimit",
      title: "Daily Message Limit",
      type: "number",
      initialValue: 3,
    }),
  ],
  preview: {
    select: {
        title: "contactNumber",
        subtitle: "dailyMessageLimit",
        },},
});
