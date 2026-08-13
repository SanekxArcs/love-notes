export interface Message {
  _key: string;
  text: string; // Required field
  isShown: boolean;
  userName?: string;
  category: 'daily' | 'extra' | 'unknown'; // Required field, removed undefined option
  createdAt?: string;
  updatedAt?: string;
  shownAt?: string | Date;
  like?: boolean;
  specificDate?: string; // MM-DD, year-independent priority date
}

export type EditMessagePayload = Pick<Message, '_key' | 'text' | 'category' | 'specificDate'>;
