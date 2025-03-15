import { DocumentTextIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const messageType = defineType({
  name: "message",
  title: "Повідомлення",
  type: "document",
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: "text",
      title: "Текст повідомлення",
      type: "text",
      description: "Обмеження 500 символами",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "isShown",
      title: "Показано?",
      type: "boolean",
      description: "Чи було показано це повідомлення",
      initialValue: false,
    }),

    defineField({
      name: "userName",
      title: "Користувач",
      type: "string",
      description: "Ім'я користувача, який отримав це повідомлення",
    }),

    defineField({
      name: "category",
      title: "Тип повідомлення",
      type: "string",
      description:
        "Невідомий якщо всеодно чи воно буде щоденим чи додатковим, Щоденне - може з'явитись покистувачі тільки як перше повідомлення на день, Додаткове - може з'явитись після щоденного",
      initialValue: "unknown",
      options: {
        layout: "radio",
        list: [
          { title: "Невідомий", value: "unknown" },
          { title: "Щоденне", value: "daily" },
          { title: "Додаткове", value: "extra" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "like",
      title: "Вподобайка",
      type: "boolean",
      description: "Чи сподобалось це повідомлення",
      initialValue: false,
    }),
    defineField({
      name: "shownAt",
      title: "Коли показано",
      type: "datetime",
      description: "Повідомлення було показано в цей час",
    }),
    defineField({
      name: "creator",
      title: "Автор",
      type: "reference",
      description: "Необхідне для відстеження власності повідомлення",
      to: [{ type: "user" }],
      validation: (Rule) =>
        Rule.required().error("Повідомлення повинно мати автора"),
      options: {
        disableNew: true,
      },
    }),
    defineField({
      name: "shownBy",
      title: "Показано користувачу:",
      type: "reference",
      description: "Кому показано це повідомлення. (Референс на користувача)",
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
      creator: "creator.name",
    },
    prepare({ text, category, like, userName, creator }) {
      const creatorName = creator ? `від ${creator}` : "❔";
      const truncatedText =
        text && text.length > 30 ? text.substring(0, 30) + "..." : text;
      const likeStatus = like ? "❤️" : "🤍";
      const shown = userName ? `для ${userName}` : "❔";
      const categoryShow =
        category === "daily" ? "📅" : category === "extra" ? "🎁" : "❓";

      return {
        title: truncatedText,
        subtitle: `${likeStatus} | ${shown} | ${categoryShow} | ${creatorName}`,
      };
    },
  },
});
