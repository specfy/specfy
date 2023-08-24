import type { Res } from '@specfy/core';

// POST /ai
export type AiOperationRewrite = {
  orgId: string;
  type: 'rewrite';
  text: string;
};
export type PostAiOperation = Res<{
  Body: AiOperationRewrite;
  Success: {
    data: { text: string };
  };
}>;
