import type { Res } from '@specfy/core';

// POST /ai
export type AiOperationRewrite = {
  type: 'rewrite';
  text: string;
};
export type AiOperationProjectDescription = {
  type: 'projectDescription';
};

export type PostAiOperation = Res<{
  Body: {
    orgId: string;
    projectId?: string | undefined;
    operation: AiOperationRewrite | AiOperationProjectDescription;
  };
  Success: {
    data: {
      text: string;
    };
  };
}>;
