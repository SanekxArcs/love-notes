export type NoteConfidence = "certain" | "likely" | "needs-check";

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
>;

export type EditPartnerNotePayload = Pick<
  PartnerNote,
  "title" | "description" | "tags" | "confidence"
>;

export interface SharedPartnerNote {
  _key: string;
  title: string;
  description: string;
  tags?: string[];
  onboardingQuestionId?: string;
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
