export interface DBTypeHasUser {
  documentId: string | null;
  revisionId: string | null;
  userId: string;
  role: 'author' | 'reviewer';
  createdAt: string;
}
