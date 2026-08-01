import { CalendarIcon } from "@sanity/icons/Calendar";
import { defineField, defineType } from "sanity";

const isIntimate = ({ parent }: { parent?: { type?: string } }) =>
  parent?.type !== "intimate";

const isMoodRelevant = ({ parent }: { parent?: { type?: string } }) =>
  parent?.type !== "intimate" && parent?.type !== "daily";

export const calendarEventType = defineType({
  name: "calendarEvent",
  title: "Подія календаря",
  type: "object",
  icon: CalendarIcon,
  groups: [
    { name: "general", title: "Загальне", default: true },
    { name: "activities", title: "Активність" },
    { name: "feedback", title: "Враження" },
  ],
  fields: [
    defineField({
      name: "type",
      title: "Тип події",
      type: "string",
      description: "Важлива/романтична подія, інтимний момент чи щоденний момент",
      initialValue: "important",
      group: "general",
      options: {
        layout: "radio",
        list: [
          { title: "Важлива/романтична подія", value: "important" },
          { title: "Інтимний момент", value: "intimate" },
          { title: "Щоденний момент", value: "daily" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      title: "Назва",
      type: "string",
      description: "Коротка назва події (наприклад, 'Річниця стосунків')",
      group: "general",
    }),
    defineField({
      name: "date",
      title: "Дата",
      type: "date",
      description: "Дата, коли відбулась чи відбудеться подія",
      group: "general",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "time",
      title: "Час",
      type: "string",
      description: "Час у форматі HH:mm (необов'язково)",
      group: "general",
    }),
    defineField({
      name: "durationMinutes",
      title: "Тривалість (хв)",
      type: "number",
      description: "Тривалість у хвилинах",
      group: "general",
      validation: (Rule) => Rule.min(0),
      hidden: isIntimate,
    }),
    defineField({
      name: "isRecurringYearly",
      title: "Повторюється щороку",
      type: "boolean",
      description: "Якщо увімкнено, подія показується щороку в цей день і місяць (наприклад, дні народження, річниці)",
      group: "general",
      initialValue: false,
    }),
    defineField({
      name: "mood",
      title: "Настрій",
      type: "string",
      description: "Як ти почуваєшся у зв'язку з цією подією",
      group: "general",
      options: {
        list: [
          { title: "😄 Чудово", value: "great" },
          { title: "🙂 Добре", value: "good" },
          { title: "😐 Нейтрально", value: "neutral" },
          { title: "😔 Сумно", value: "sad" },
          { title: "😢 Погано", value: "upset" },
          { title: "❤️‍🔥 Романтично", value: "romantic" },
          { title: "😡 Роздратовано", value: "angry" },
        ],
      },
      hidden: isMoodRelevant,
    }),

    // --- Інтимний момент: активність (the "what") ---
    defineField({
      name: "activities",
      title: "Типи активності",
      type: "array",
      description: "Непенетративні (petting, manual, oral, toys), пенетративні (vaginal, anal) чи BDSM/kink",
      group: "activities",
      of: [{ type: "string" }],
      options: {
        layout: "grid",
        list: [
          { title: "Ручна стимуляція (manual)", value: "manual" },
          { title: "Оральний секс (oral)", value: "oral" },
          { title: "Вагінальний секс (vaginal)", value: "vaginal" },
          { title: "Анальний секс (anal)", value: "anal" },
          { title: "Іграшки (toys)", value: "toys" },
          { title: "BDSM / Kink", value: "bdsm" },
        ],
      },
      hidden: isIntimate,
    }),
    defineField({
      name: "initiatedBy",
      title: "Хто ініціював",
      type: "string",
      description: "Хто був ініціатором",
      group: "activities",
      options: {
        list: [
          { title: "Я", value: "me" },
          { title: "Партнер", value: "partner" },
          { title: "Обоє", value: "mutual" },
        ],
      },
      hidden: isIntimate,
    }),
    defineField({
      name: "selfFinished",
      title: "Я кінчив(ла)",
      type: "boolean",
      group: "activities",
      hidden: isIntimate,
    }),
    defineField({
      name: "partnerFinished",
      title: "Партнер кінчив(ла)",
      type: "boolean",
      group: "activities",
      hidden: isIntimate,
    }),
    defineField({
      name: "protectionUsed",
      title: "Використано захист",
      type: "boolean",
      description: "Чи використовувався презерватив або інший вид контрацепції",
      group: "activities",
      initialValue: false,
      hidden: isIntimate,
    }),
    defineField({
      name: "protectionType",
      title: "Вид захисту",
      type: "string",
      group: "activities",
      options: {
        list: [
          { title: "Презерватив", value: "condom" },
          { title: "Латексна серветка (dental dam)", value: "dental_dam" },
          { title: "Протизаплідні таблетки", value: "birth_control_pill" },
          { title: "Спіраль (ВМС)", value: "iud" },
          { title: "Інше", value: "other" },
        ],
      },
      hidden: ({ parent }) => parent?.type !== "intimate" || !parent?.protectionUsed,
    }),

    // --- Інтимний момент: враження (the "experience") ---
    defineField({
      name: "rating",
      title: "Оцінка (1-10)",
      type: "number",
      description: "Суб'єктивна оцінка задоволення від 1 до 10, для власної аналітики",
      group: "feedback",
      validation: (Rule) => Rule.min(1).max(10),
      hidden: isIntimate,
    }),
    defineField({
      name: "highlights",
      title: "Теги враження",
      type: "array",
      description: "Що виділяло цей момент",
      group: "feedback",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
        list: [
          { title: "Інтимно", value: "intimate" },
          { title: "Експериментально", value: "experimental" },
          { title: "Весело", value: "fun" },
          { title: "Швидко", value: "fast" },
          { title: "Довго", value: "long" },
          { title: "Романтично", value: "romantic" },
          { title: "Спонтанно", value: "spontaneous" },
          { title: "Заплановано", value: "planned" },
        ],
      },
      hidden: isIntimate,
    }),
    defineField({
      name: "note",
      title: "Нотатка",
      type: "text",
      description: "Довільний опис, враження, що сподобалось, що спробувати наступного разу",
      group: ["general", "feedback"],
    }),
    defineField({
      name: "createdAt",
      title: "Коли створено",
      type: "datetime",
      description: "Коли цей запис було створено",
      group: "general",
    }),
  ],
  preview: {
    select: {
      type: "type",
      title: "title",
      date: "date",
      mood: "mood",
      activities: "activities",
      rating: "rating",
    },
    prepare({ type, title, date, mood, activities, rating }) {
      const typeIcon = type === "intimate" ? "💞" : type === "daily" ? "📝" : "🎉";
      const label =
        title ||
        (type === "intimate"
          ? (activities || []).join(", ") || "Інтимний момент"
          : type === "daily"
            ? "Щоденний момент"
            : "Подія");
      const subtitle = [date, mood, rating ? `⭐ ${rating}/10` : null]
        .filter(Boolean)
        .join(" · ");

      return {
        title: `${typeIcon} ${label}`,
        subtitle,
      };
    },
  },
});
