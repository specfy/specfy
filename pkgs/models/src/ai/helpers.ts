import type { Documents } from '@specfy/db';

import { internalTypeToText, type ComponentType } from '../components/index.js';

import type { ComponentForPrompt } from './types.js';

/**
 * Output a standardized list of components that OpenAI can understand
 * e.g:
 * Hosting: GCP
 * Saas: Algolia, Datadog
 */
export function componentsToPrompt(
  components: ComponentForPrompt[],
  withId: boolean = false
): string {
  const groups: Partial<Record<ComponentType, ComponentForPrompt[]>> = {};
  for (const component of components) {
    const type: ComponentType = component.type;
    if (!(type in groups)) {
      groups[type] = [];
    }

    groups[type]!.push(component);
  }
  return `Technologies:
${Object.entries(groups)
  .map(([key, items]) => {
    if (key === 'project') {
      return `Depends on internal product: ${items
        .map((item) => `${item.name}${withId ? ` (id: ${item.slug})` : ''}`)
        .join(', ')}`;
    }
    return `${internalTypeToText[key as ComponentType]}: ${items
      .map((item) => `${item.name}${withId ? ` (id: ${item.slug})` : ''}`)
      .join(', ')}`;
  })
  .join('\n')}`;
}

/**
 * Output a standardized list of documents that OpenAI can understand
 * e.g:
 * path: Title
 * /docs/contributing: Contributing
 */
export function documentsToPrompt(
  documents: Array<Pick<Documents, 'name' | 'slug'>>
): string {
  return `Documentation:
${documents
  .map((doc) => {
    return `/${doc.slug} : ${doc.name}`;
  })
  .join('\n')}`;
}
