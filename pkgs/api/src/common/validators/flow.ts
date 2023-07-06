import { z } from 'zod';

import { schemaId } from './common.js';
import { min, max, wMax, wMin, hMax, hMin } from './flow.constants.js';

export const schemaDisplay = z
  .object({
    zIndex: z.number().min(0).max(100),
    pos: z
      .object({
        x: z.number().min(min).max(max),
        y: z.number().min(min).max(max),
      })
      .strict(),
    size: z
      .object({
        width: z.number().min(wMin).max(wMax),
        height: z.number().min(hMin).max(hMax),
      })
      .strict(),
  })
  .strict()
  .partial({ zIndex: true });

export const schemaPortSource = z.enum(['st', 'sr', 'sb', 'sl']);
export const schemaPortTarget = z.enum(['tt', 'tr', 'tb', 'tl']);

export const schemaEdges = z.array(
  z
    .object({
      target: schemaId, // TODO: Val that it exists if not created
      read: z.boolean(),
      write: z.boolean(),
      vertices: z.array(
        z
          .object({
            x: z.number().min(min).max(max),
            y: z.number().min(min).max(max),
          })
          .strict()
      ),
      portSource: schemaPortSource,
      portTarget: schemaPortTarget,
    })
    .strict()
);
