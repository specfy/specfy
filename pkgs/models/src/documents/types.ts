import type { Documents } from '@specfy/db';

export enum DocumentType {
  'pb' = 'pb',
  'rfc' = 'rfc',
  'doc' = 'doc',
}
export type DBDocument = Omit<Documents, 'createdAt' | 'updatedAt'> & {
  type: keyof typeof DocumentType;
  createdAt: string;
  updatedAt: string;
};
