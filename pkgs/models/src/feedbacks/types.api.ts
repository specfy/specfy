import type { Res } from '@specfy/core';

// POST /
export type PostFeedback = Res<{
  Body: {
    orgId: string;
    feedback: string;
    referer: string;
  };
  Success: { data: { done: true } };
}>;
