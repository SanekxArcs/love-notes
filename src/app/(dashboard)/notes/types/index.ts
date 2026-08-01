export interface PartnerNote {
  _key: string;
  title: string;
  description: string;
  tags?: string[];
  onboardingQuestionId?: string;
  isShared?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type NewPartnerNote = Pick<
  PartnerNote,
  "title" | "description" | "tags" | "onboardingQuestionId"
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
}

export interface ChatTurn {
  role: "user" | "model";
  text: string;
}
