export type DBReview = {
  id: number;

  orgId: string;
  projectId: string;
  revisionId: string;
  userId: string;
  commentId: number | null;

  createdAt: string;
};
