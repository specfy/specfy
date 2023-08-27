import type { Res } from '@specfy/core';

// POST /ai
export type AiOperationRewrite = {
  type: 'rewrite';
  text: string;
};
export type AiOperationProjectDescription = {
  type: 'project.description';
};
export type AiOperationProjectOnboarding = {
  type: 'project.onboarding';
};

export type AiOperationAll =
  | AiOperationRewrite
  | AiOperationProjectDescription
  | AiOperationProjectOnboarding;
export type AiOperationType = Pick<AiOperationAll, 'type'>['type'];
export type PostAiOperation = Res<{
  Body: {
    orgId: string;
    projectId?: string | undefined;
    operation: AiOperationAll;
  };
  Success: {
    data: {
      text: string;
    };
  };
}>;
