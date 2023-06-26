import type { FastifyRequest } from 'fastify';
import z from 'zod';

import { schemaId, schemaOrgId } from './validators/index.js';

// export function valUniqueColumn(
//   model: ModelStatic<any>,
//   col: string,
//   display: string
// ) {
//   return async (val: string, ctx) => {
//     const res = await model.findOne({ where: { [col]: val } });
//     if (!res) {
//       return;
//     }

//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       params: { code: 'exists' },
//       message: `This ${display} is already used`,
//     });
//   };
// }

// export function valIdAvailable(model: ModelStatic<any>) {
//   return schemaId.superRefine(valUniqueColumn(model, 'id', 'ID'));
// }

export function valOrgId(req: FastifyRequest) {
  return schemaOrgId.superRefine((val, ctx) => {
    const res = req.perms!.find(
      (perm) =>
        perm.userId === req.user!.id && perm.orgId === val && !perm.projectId
    );
    if (res) {
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      params: { code: 'forbidden' },
      message:
        "The organization doesn't exists or you don't have the permissions",
    });
  });
}

export function valProjectId(req: FastifyRequest) {
  return schemaId.superRefine((val, ctx) => {
    const res = req.perms!.find(
      (perm) => perm.userId === req.user!.id && perm.projectId === val
    );
    if (res) {
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      params: { code: 'forbidden' },
      message: "The project doesn't exists or you don't have the permissions",
    });
  });
}
