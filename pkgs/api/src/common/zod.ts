import type { ModelStatic } from 'sequelize';
import z from 'zod';

import type { Perm } from '../models';

import { alphabet, size } from './id';

export function valUniqueColumn(
  model: ModelStatic<any>,
  col: string,
  display: string
) {
  return async (val: string, ctx) => {
    const res = await model.findOne({ where: { [col]: val } });
    if (!res) {
      return;
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      params: { code: 'exists' },
      message: `This ${display} is already used`,
    });
  };
}

export function valId() {
  return z
    .string()
    .min(size)
    .max(size)
    .regex(new RegExp(`^[${alphabet}]+$`));
}

export function valIdAvailable(model: ModelStatic<any>) {
  return valId().superRefine(valUniqueColumn(model, 'id', 'ID'));
}

export function valOrgId(perms: Perm[]) {
  return z
    .string()
    .min(4)
    .max(36)
    .superRefine((val, ctx) => {
      const res = perms.find((perm) => perm.orgId === val && !perm.projectId);
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

// export function valQueryOrgId<TQuery extends { org_id: string }>(
//   perms: Perm[],
//   query: TQuery
// ) {
//   return z
//     .object({
//       org_id: valOrgId(perms),
//     })
//     .strict()
//     .safeParse(query);
// }
