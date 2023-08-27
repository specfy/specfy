import type { Components } from '@specfy/db';

export type ComponentForPrompt = Pick<
  Components,
  'type' | 'name' | 'techId' | 'slug'
>;
