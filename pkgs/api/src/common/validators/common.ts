import { z } from 'zod';

import { alphabet, minSize, maxSize } from '../id';

export const schemaOrgId = z
  .string()
  .min(4)
  .max(36)
  .regex(/^[a-z][a-z0-9-]+[a-z0-9]/, {
    message: 'Should only be lowercase letters, numbers and hyphen',
  });

export const schemaId = z
  .string()
  .min(minSize)
  .max(maxSize)
  .regex(new RegExp(`^[${alphabet}]+$`));

export const schemaSlug = z
  .string()
  .min(2)
  .max(36)
  .regex(/^[a-z][a-z0-9-]+[a-z0-9]/, {
    message: 'Should only be lowercase letters, numbers and hyphen',
  });
