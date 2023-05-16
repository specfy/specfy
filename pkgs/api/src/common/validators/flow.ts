import { z } from 'zod';

import { schemaId } from './common';

// const portPosition = ['bottom', 'left', 'right', 'top']; // TODO: enforce union
const min = -99999;
const max = 99999;
const wMin = 50;
const wMax = 2000;
const hMin = 32;
const hMax = 2000;

export const schemaDisplay = z
  .object({
    zIndex: z.number().min(0).max(100),
    pos: z
      .object({
        x: z.number().min(min).max(max),
        y: z.number().min(min).max(max),
        width: z.number().min(wMin).max(wMax),
        height: z.number().min(hMin).max(hMax),
      })
      .strict(),
  })
  .strict();

export const schemaPort = z.enum(['bottom', 'left', 'right', 'top']);

export const schemaEdges = z.array(
  z
    .object({
      to: schemaId, // TODO: Val that it exists if not created
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
      portSource: schemaPort,
      portTarget: schemaPort,
    })
    .strict()
);
