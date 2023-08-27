import { envs } from '@specfy/core';
import type { Documents, Projects } from '@specfy/db';
import type OpenAI from 'openai';

import { prosemirrorToText } from '../prosemirror/prosemirrorToText.js';

import { componentsToPrompt, documentsToPrompt } from './helpers.js';
import type { ComponentForPrompt } from './types.js';

/**
 * Rewrite the given content
 */
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

/**
 * Create, from scratch, a project description.
 * The components list helps writing more details about how it works.
 */
export function aiPromptProjectDescription(opts: {
  project: Pick<Projects, 'name'>;
  components: ComponentForPrompt[];
}): OpenAI.Chat.Completions.CreateChatCompletionRequestMessage[] {
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
      content: `Project name is ${opts.project.name}

${componentsToPrompt(opts.components)}
  `,
    },
  ];
}

/**
 * Generate an onboarding based on everything we know about a project.
 */
export function aiPromptProjectOnboarding(opts: {
  project: Pick<Projects, 'name' | 'slug' | 'orgId' | 'description' | 'links'>;
  components: ComponentForPrompt[];
  documents: Array<Pick<Documents, 'name' | 'slug'>>;
}): OpenAI.Chat.Completions.CreateChatCompletionRequestMessage[] {
  const url = `${envs.APP_HOSTNAME}/${opts.project.orgId}/${opts.project.slug}`;
  return [
    {
      role: 'system',
      content: `You are technical documentation assistant, you are given a description, a list of files for the documentation, a list of technologies used in the project and a list of link.
Write 4 sections:
1. A general introduction for project titled Onboarding
2. A list of steps in english based on the documentation, only pick the relevant link that would be interesting for an onboarding with explanation. Select one relevant emoji per step.
Prepend the link with the url "${url}/doc/"
Following this pattern:
<li>{emoji} <strong>{name of the step}</strong>: {explanation} {link with the name}</li>
3. Highlight the most important technologies from the list and explain what they do in one sentence. Maximum 5.
Link this resource by prepending this url "${url}/c/" to the id
Following this pattern:
<li><strong>{name of the technology}</strong>: {explanation} {link with the name}</li>
4. Next steps in bullet point. Use the links if any.

Output in HTML without the body tag`,
    },
    {
      role: 'user',
      content: `Project name is ${opts.project.name}
${prosemirrorToText(opts.project.description)}

${componentsToPrompt(opts.components, true)}

${documentsToPrompt(opts.documents)}

Links:
${opts.project.links.map((link) => {
  return `${link.title}: ${link.url}`;
})}
Infrastructure Flow: ${url}/flow
`,
    },
  ];
}

// You are technical documentation assistant, you are given a description, a file tree of the documentation and a list of technology. Output in an HTML format only what is inside the body tag. Documentation link are HTML, prepend the URL with "${envs.APP_HOSTNAME}/${opts.project.orgId}/${opts.project.slug}/doc/"
// 1. Write a general introduction for project
// 2. A list of task to be ready to code on this project, only pick the relevant documentation link that would be interesting for an onboarding
// 3. Highlight important details about the technology
