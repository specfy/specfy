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

export type PostAiOperation = Res<{
  Body: {
    orgId: string;
    projectId?: string | undefined;
    operation:
      | AiOperationRewrite
      | AiOperationProjectDescription
      | AiOperationProjectOnboarding;
  };
  Success: {
    data: {
      text: string;
    };
  };
}>;
