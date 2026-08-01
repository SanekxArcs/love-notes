import { DocumentIcon } from "@sanity/icons/Document";
import { defineField, defineType } from "sanity";

export const partnerNoteType = defineType({
  name: "partnerNote",
  title: "Нотатка про партнера",
  type: "object",
  icon: DocumentIcon,
  fields: [
    defineField({
      name: "title",
      title: "Заголовок",
      type: "string",
      description: "Наприклад: 'Квіти', 'Музика', 'Розмір одягу'",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Опис",
      type: "text",
      description: "Деталі — те, що варто запам'ятати",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "tags",
      title: "Теги",
      type: "array",
      description: "Довільні теги для пошуку та фільтрації",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "onboardingQuestionId",
      title: "ID питання з опитувальника",
      type: "string",
      description: "Заповнюється автоматично, якщо нотатку створено через стартовий опитувальник",
    }),
    defineField({
      name: "createdAt",
      title: "Коли створено",
      type: "datetime",
    }),
    defineField({
      name: "updatedAt",
      title: "Коли оновлено",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "title",
      description: "description",
      tags: "tags",
    },
    prepare({ title, description, tags }) {
      const tagsSuffix = tags?.length ? ` · ${tags.join(", ")}` : "";
      return {
        title: title || "Без заголовку",
        subtitle: `${description ?? ""}${tagsSuffix}`,
      };
    },
  },
});
