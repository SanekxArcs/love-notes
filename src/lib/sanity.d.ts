// import { SanityClient } from 'next-sanity';

declare module 'next-sanity' {
  interface SanityClient {
    transaction(): SanityTransaction;
    getDocument<T>(id: string): Promise<T | null>;
  }

  interface SanityTransaction {
    create(doc: Record<string, unknown>): SanityTransaction;
    commit(): Promise<SanityTransactionResult>;
  }

  type SanityTransactionResult = 
    | Array<{id?: string; document?: Record<string, unknown>}>
    | {documentIds?: string[]; results?: Array<{id: string; document: Record<string, unknown>}>};
}

export {};
