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
}

export type NewPartnerNote = Pick<
  PartnerNote,
  | "title"
  | "description"
  | "tags"
  | "onboardingQuestionId"
  | "mirroredFromNoteKey"
>;

export type EditPartnerNotePayload = Pick<
  PartnerNote,
  "title" | "description" | "tags"
>;

export interface SharedPartnerNote {
  _key: string;
  title: string;
  description: string;
  tags?: string[];
  onboardingQuestionId?: string;
}

export interface NoteSuggestion {
  key: string;
  title: string;
  question: string;
  tags: string[];
  onboardingQuestionId?: string;
  createdAt?: string;
  partnerName: string;
}

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}
