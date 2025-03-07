export interface Message {
  _id: string;
  text: string; // Required field
  isShown: boolean;
  userName?: string;
  category: 'daily' | 'extra' | 'unknown'; // Required field, removed undefined option
  shownAt?: string | Date;
  like?: boolean;
}

export type EditMessagePayload = Pick<Message, '_id' | 'text' | 'category'>;
