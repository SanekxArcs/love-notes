export type NoteConfidence = "certain" | "likely" | "needs-check";
export type NotePerspective = "partner" | "self";

export const NOTE_PERSPECTIVE_OPTIONS: Array<{
  value: NotePerspective;
  label: string;
  description: string;
}> = [
  {
    value: "partner",
    label: "Про партнера",
    description: "Твої спостереження, побажання й знання про партнера",
  },
  {
    value: "self",
    label: "Про себе",
    description: "Твоя власна відповідь, яку партнер побачить автоматично",
  },
];

export const NOTE_CONFIDENCE_OPTIONS: Array<{
  value: NoteConfidence;
  label: string;
  description: string;
}> = [
  {
    value: "certain",
    label: "Точно знаю",
    description: "Це перевірений факт",
  },
  {
    value: "likely",
    label: "Здається",
    description: "Є підстава так думати, але без повної впевненості",
  },
  {
    value: "needs-check",
    label: "Треба уточнити",
    description: "Краще запитати або перевірити",
  },
];

export interface NoteCorrection {
  _key: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface PartnerNote {
  _key: string;
  title: string;
  description: string;
  tags?: string[];
  onboardingQuestionId?: string;
  mirroredFromNoteKey?: string;
  isShared?: boolean;
  createdAt?: string;
  updatedAt?: string;
  confidence?: NoteConfidence;
  perspective?: NotePerspective;
  corrections?: NoteCorrection[];
}

export type NewPartnerNote = Pick<
  PartnerNote,
  | "title"
  | "description"
  | "tags"
  | "onboardingQuestionId"
  | "mirroredFromNoteKey"
  | "confidence"
  | "perspective"
>;

export type EditPartnerNotePayload = Pick<
  PartnerNote,
  "title" | "description" | "tags" | "confidence" | "perspective"
>;

export interface SharedPartnerNote {
  _key: string;
  title: string;
  description: string;
  tags?: string[];
  onboardingQuestionId?: string;
  perspective?: NotePerspective;
  corrections?: NoteCorrection[];
}

export interface NotePromptSuggestion {
  title: string;
  question: string;
  tags: string[];
  onboardingQuestionId?: string;
  key?: string;
}

export interface NoteSuggestion extends NotePromptSuggestion {
  key: string;
  createdAt?: string;
  partnerName: string;
}

export interface AiNoteTopic extends NotePromptSuggestion {}

export interface AiNoteGap extends AiNoteTopic {
  area: string;
  reason: string;
}

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}
