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
      content: `You are technical writer. With the information provided write a README.md that you would find in Github.
Split in 4 sections:
1. An Overview section
2. A Get Started section, bullet point sentences with one emoji per line. Use the list of documents provided, ONLY use what you would find in a README (e.g: installation, guidelines, deployment, contributing, etc.)
3. A Technology section, highlighting 3-5 relevant technologies in the list, with a quick sentence how about what they do and the link
4. A next step section, write use generic advices and use the links in the last list

If the provided information needed to write a section are not enough then simply write: "Insufficient information.". The writer should refrain using links that were not provided by the user.
End the content with encouraging words with emojis.
Output in markdown`,
    },
    {
      role: 'user',
      content: `Project name is Analytics
The Analytics project collects data from various sources, processes it, and presents it in dashboards and reports. These outputs show key indicators and trends for the business.

Technologies:
Hosting: GCP http://localhost:5173/acme/analytics/c/undefined-gcp, GCE http://localhost:5173/acme/analytics/c/undefined-gce
Database: Postgres http://localhost:5173/acme/analytics/c/undefined-postgres
Depends on internal product: Billing http://localhost:5173/acme/analytics/c/undefined-billing

Documentation:
http://localhost:5173/acme/analytics/doc/readme: README
http://localhost:5173/acme/analytics/doc/docs/contributing: Contributing
http://localhost:5173/acme/analytics/doc/docs/installation: Installation
http://localhost:5173/acme/analytics/doc/docs/deploy: Deploy
http://localhost:5173/acme/analytics/doc/docs/deploy.terraform: Deploy With Terraform
http://localhost:5173/acme/analytics/doc/docs/foobar: Foobar

Links:
Github: https://github.com/specfy/specfy
Discord: https://discord.gg/foobar
Infrastructure Flow: http://localhost:5173/acme/analytics/flow`,
    },
    {
      role: 'assistant',
      content: `# Overview
The Analytics project collects data from various sources, processes it, and presents it in dashboards and reports. These outputs show key indicators and trends for the business. The project also employs machine learning and statistical methods to analyze data, helping businesses make data-based decisions.

# Get Started
- 📥 **Installation**: Clone the repository from [Github](https://github.com/specfy/specfy)

# Technology
The Analytics project utilizes the following technologies:
- The project is hosted on [GCP](http://localhost:5173/acme/analytics/c/jZDC3Lsc01-gcp)
- We are using [Postgres](http://localhost:5173/acme/analytics/c/jZDC3Lsc04-postgresql) as the main Database
- You would want to checkout out [Billing](http://localhost:5173/acme/analytics/c/undefined-billing) project.

# Next Steps
To further explore the project, you can:
- Check the [Github repository](https://github.com/specfy/specfy)
- Join our community on the [Discord](https://discord.gg/foobar)
- Follow the infrastructure flow [here](http://localhost:5173/acme/analytics/flow) to understand the project's architecture.`,
    },
    {
      role: 'user',
      content: `Project name is ${opts.project.name}
${prosemirrorToText(opts.project.description)}

${componentsToPrompt(opts.components, url)}

${documentsToPrompt(opts.documents, url)}

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
