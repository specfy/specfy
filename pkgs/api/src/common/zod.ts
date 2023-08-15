import { checkInheritedPermissions } from '@specfy/models';
import type { DBPerm } from '@specfy/models';
import type { FastifyRequest } from 'fastify';
import type { RefinementCtx } from 'zod';
import z from 'zod';

export function valPermissions(req: FastifyRequest, role: DBPerm['role']) {
  return (
    data: {
      org_id?: string;
      orgId?: string;
      project_id?: string | undefined;
      projectId?: string | undefined;
    },
    ctx: RefinementCtx
  ): void => {
    const orgId = data.orgId || data.org_id;
    const projectId = data.projectId || data.project_id;
    if (!orgId) {
      // It's weird tho
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        params: { code: 'forbidden' },
        message:
          "Targeted resource doesn't exists or you don't have the permissions",
      });
      return;
    }

    if (checkInheritedPermissions(req.perms!, role, orgId, projectId)) {
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      params: { code: 'forbidden' },
      message:
        "Targeted resource doesn't exists or you don't have the permissions",
    });
  };
}
