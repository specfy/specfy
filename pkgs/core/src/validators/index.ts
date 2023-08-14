import { z } from 'zod';

import { alphabet, minSize, maxSize } from '../id';

export * from './prosemirror.js';

const slug = /^[a-z]([a-z0-9-]+)?[a-z0-9]$/;
const token = new RegExp(`^[${alphabet}]+$`);

export const schemaOrgId = z.string().min(4).max(36).regex(slug, {
  message: 'Should only be lowercase letters, numbers and hyphen',
});

export const schemaId = z.string().min(minSize).max(maxSize).regex(token);

export const schemaSlug = z.string().min(2).max(36).regex(slug, {
  message: 'Should only be lowercase letters, numbers and hyphen',
});

export const schemaToken = z.string().min(32).max(32).regex(token);
