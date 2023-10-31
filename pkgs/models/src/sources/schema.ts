import { z } from 'zod';

export const schemaGitHubSettings = z
  .object({
    branch: z.string().max(255),
    documentation: z
      .object({
        enabled: z.boolean(),
        path: z.string().max(255),
      })
      .strict(),
    stack: z
      .object({
        enabled: z.boolean(),
        path: z.string().max(255),
      })
      .strict(),
    git: z
      .object({
        enabled: z.boolean(),
      })
      .strict(),
  })
  .strict();
