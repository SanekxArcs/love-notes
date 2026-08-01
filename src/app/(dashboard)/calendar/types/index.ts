export type CalendarEventType = "important" | "intimate" | "daily" | "message";
export type IntimateActivity = "manual" | "oral" | "vaginal" | "anal" | "toys" | "bdsm";
export type ProtectionType = "condom" | "dental_dam" | "birth_control_pill" | "iud" | "other";
export type InitiatedBy = "me" | "partner" | "mutual";
export type Mood = "great" | "good" | "neutral" | "sad" | "upset" | "romantic" | "angry";
export type Highlight =
  | "intimate"
  | "experimental"
  | "fun"
  | "fast"
  | "long"
  | "romantic"
  | "spontaneous"
  | "planned";

export interface CalendarEvent {
  _key: string;
  type: CalendarEventType;
  title?: string;
  date: string; // ISO date, YYYY-MM-DD
  time?: string; // HH:mm
  durationMinutes?: number;
  isRecurringYearly?: boolean;
  mood?: Mood;
  note?: string;
  // Intimate — activity
  activities?: IntimateActivity[];
  initiatedBy?: InitiatedBy;
  selfFinished?: boolean;
  partnerFinished?: boolean;
  protectionUsed?: boolean;
  protectionType?: ProtectionType;
  // Intimate — feedback
  rating?: number; // 1-10
  highlights?: Highlight[];
  createdAt?: string;
  ownerId: string;
  ownerName?: string;
  isMine: boolean;
}

export type NewCalendarEvent = Omit<
  CalendarEvent,
  "_key" | "ownerId" | "ownerName" | "isMine" | "createdAt"
>;

export const MOOD_OPTIONS: { value: Mood; label: string }[] = [
  { value: "great", label: "😄 Чудово" },
  { value: "good", label: "🙂 Добре" },
  { value: "neutral", label: "😐 Нейтрально" },
  { value: "sad", label: "😔 Сумно" },
  { value: "upset", label: "😢 Погано" },
  { value: "romantic", label: "❤️‍🔥 Романтично" },
  { value: "angry", label: "😡 Роздратовано" },
];

export const ACTIVITY_OPTIONS: { value: IntimateActivity; label: string }[] = [
  { value: "manual", label: "Ручна стимуляція" },
  { value: "oral", label: "Оральний" },
  { value: "vaginal", label: "Вагінальний" },
  { value: "anal", label: "Анальний" },
  { value: "toys", label: "Іграшки" },
  { value: "bdsm", label: "BDSM / Kink" },
];

export const PROTECTION_OPTIONS: { value: ProtectionType; label: string }[] = [
  { value: "condom", label: "Презерватив" },
  { value: "dental_dam", label: "Латексна серветка" },
  { value: "birth_control_pill", label: "Протизаплідні таблетки" },
  { value: "iud", label: "Спіраль (ВМС)" },
  { value: "other", label: "Інше" },
];

export const HIGHLIGHT_OPTIONS: { value: Highlight; label: string }[] = [
  { value: "intimate", label: "Інтимно" },
  { value: "experimental", label: "Експериментально" },
  { value: "fun", label: "Весело" },
  { value: "fast", label: "Швидко" },
  { value: "long", label: "Довго" },
  { value: "romantic", label: "Романтично" },
  { value: "spontaneous", label: "Спонтанно" },
  { value: "planned", label: "Заплановано" },
];
