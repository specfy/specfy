import type { Components, Projects } from '@specfy/db';
import type OpenAI from 'openai';

import { internalTypeToText, type ComponentType } from '../components/index.js';

export function aiPromptRewrite(opts: {
  text: string;
}): OpenAI.Chat.Completions.CreateChatCompletionRequestMessage[] {
  return [
    {
      role: 'system',
      content:
        'You rewrite content you are provided with for an engineer. Do not use adverb or subjective language.',
    },
    {
      role: 'user',
      content: opts.text,
    },
  ];
}

export function aiPromptProjectDescription(opts: {
  project: Pick<Projects, 'name'>;
  components: Array<Pick<Components, 'type' | 'name' | 'techId'>>;
}): OpenAI.Chat.Completions.CreateChatCompletionRequestMessage[] {
  const groups: Partial<Record<ComponentType, string[]>> = {};
  for (const component of opts.components) {
    const type: ComponentType = component.type;
    if (!(type in groups)) {
      groups[type] = [];
    }

    groups[type]!.push(component.name);
  }

  return [
    {
      role: 'system',
      content: `You describe a technical project for an engineer.
3 paragraphs maximum
DO NOT use adjective, superlative or adverb.
Details why it exists in one paragraph with a line break at end
Details briefly how it works
Use the list of technologies to describe how it works. Choose only the most relevant ones`,
    },
    {
      role: 'user',
      content: `Project name is "${opts.project.name}"

The list of technologies that is used in this project:
${Object.entries(groups)
  .map(([key, items]) => {
    if (key === 'project') {
      return `Depends on internal product: ${items.join(', ')}`;
    }
    return `${internalTypeToText[key as ComponentType]}: ${items.join(', ')}`;
  })
  .join('\n')}
  `,
    },
  ];
}
