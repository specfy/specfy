import { describe, expect, it } from 'vitest';

import {
  aiPromptProjectDescription,
  aiPromptRewrite,
  aiPromptProjectOnboarding,
} from './prompt.js';

import type { ComponentForPrompt } from './types.js';

const components: ComponentForPrompt[] = [
  { id: '1', name: 'GCP', type: 'cloud', techId: 'gcp', slug: 'gcp' },
  { id: '2', name: 'GCE', type: 'hosting', techId: 'gcp.gce', slug: 'gce' },
  { id: '3', name: 'Aggregator', type: 'service', techId: null, slug: 'aggr' },
  {
    id: '4',
    name: 'Algolia',
    type: 'saas',
    techId: 'algolia',
    slug: 'algolia',
  },
  {
    id: '5',
    name: 'Postgres',
    type: 'db',
    techId: 'postgres',
    slug: 'postgres',
  },
  { id: '6', name: 'SQS', type: 'messaging', techId: 'aws.sqs', slug: 'sqs' },
  { id: '7', name: 'Billing', type: 'project', techId: null, slug: 'billing' },
];

describe('aiPromptRewrite', () => {
  it('should output the prompt', () => {
    const res = aiPromptRewrite({
      text: 'Specfy is an awesome platform',
    });
    expect(res).toMatchSnapshot();
  });
});

describe('aiPromptProjectDescription', () => {
  it('should output the prompt', () => {
    const res = aiPromptProjectDescription({
      project: { name: 'Analytics' },
      components,
    });
    expect(res).toMatchSnapshot();
  });
});

describe('aiPromptProjectOnboarding', () => {
  it('should output the prompt', () => {
    const res = aiPromptProjectOnboarding({
      project: {
        name: 'Analytics',
        slug: 'analytics',
        orgId: 'acme',
        links: [{ title: 'GitHub', url: 'https://github.com/specfy/specfy' }],
        description: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: { uid: 'UidC3Ls190' },
              content: [
                {
                  type: 'text',
                  text: 'The Analytics project collects data from various sources, processes it, and presents it in dashboards and reports. These outputs show key indicators and trends for the business.',
                },
                { type: 'hardBreak' },
                {
                  type: 'text',
                  text: 'The project also employs machine learning and statistical methods to analyze data. This analysis helps in predicting trends and making recommendations based on past data. This project assists businesses in making data-based decisions.',
                },
              ],
            },
          ],
        },
      },
      components,
      documents: [
        { name: 'README', slug: 'readme' },
        { name: 'Contributing', slug: 'docs/contributing' },
        { name: 'Installation', slug: 'docs/installation' },
        { name: 'Deploy', slug: 'docs/deploy' },
        { name: 'Deploy With Terraform', slug: 'docs/deploy.terraform' },
      ],
    });
    expect(res).toMatchSnapshot();
  });
});
