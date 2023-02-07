export interface DBTypeHasUser {
  documentId: string | null;
  userId: string;
  role: 'author' | 'reviewer';
  createdAt: string;
}
