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
      name: "confidence",
      title: "Рівень впевненості",
      type: "string",
      description: "Приватний статус для автора нотатки; партнер його не бачить",
      options: {
        list: [
          { title: "Точно знаю", value: "certain" },
          { title: "Здається", value: "likely" },
          { title: "Треба уточнити", value: "needs-check" },
        ],
      },
      initialValue: "certain",
    }),
    defineField({
      name: "onboardingQuestionId",
      title: "ID питання з опитувальника",
      type: "string",
      description: "Заповнюється автоматично, якщо нотатку створено через стартовий опитувальник",
    }),
    defineField({
      name: "mirroredFromNoteKey",
      title: "Створено з пропозиції партнера",
      type: "string",
      description:
        "Технічний ключ приватної нотатки партнера, яка запропонувала цю тему. Вміст нотатки не копіюється.",
      hidden: true,
    }),
    defineField({
      name: "isShared",
      title: "Показано партнеру",
      type: "boolean",
      description: "Якщо увімкнено, цю нотатку зможе побачити партнер",
      initialValue: false,
    }),
    defineField({
      name: "corrections",
      title: "Уточнення від партнера",
      type: "array",
      description:
        "Додаткові уточнення партнера. Оригінальний текст нотатки не змінюється.",
      of: [
        {
          type: "object",
          name: "noteCorrection",
          fields: [
            defineField({ name: "authorId", title: "Author ID", type: "string" }),
            defineField({ name: "authorName", title: "Автор", type: "string" }),
            defineField({ name: "text", title: "Уточнення", type: "text" }),
            defineField({
              name: "createdAt",
              title: "Створено",
              type: "datetime",
            }),
          ],
          preview: {
            select: { title: "authorName", subtitle: "text" },
          },
        },
      ],
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
      isShared: "isShared",
    },
    prepare({ title, description, tags, isShared }) {
      const tagsSuffix = tags?.length ? ` · ${tags.join(", ")}` : "";
      const sharedPrefix = isShared ? "👁️ " : "";
      return {
        title: `${sharedPrefix}${title || "Без заголовку"}`,
        subtitle: `${description ?? ""}${tagsSuffix}`,
      };
    },
  },
});
