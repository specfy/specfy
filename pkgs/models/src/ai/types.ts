import type { Components } from '@specfy/db';

export type ComponentForPrompt = Pick<
  Components,
  'id' | 'type' | 'name' | 'techId' | 'slug'
>;
