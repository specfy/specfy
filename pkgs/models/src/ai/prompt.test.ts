import { describe, expect, it } from 'vitest';

import {
  aiPromptProjectDescription,
  aiPromptRewrite,
  aiPromptProjectOnboarding,
} from './prompt.js';

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
      components: [
        { name: 'GCP', type: 'hosting', techId: 'gcp', slug: 'gcp' },
        { name: 'GCE', type: 'hosting', techId: 'gcp.gce', slug: 'gce' },
        { name: 'Aggregator', type: 'service', techId: null, slug: 'aggr' },
        { name: 'Algolia', type: 'saas', techId: 'algolia', slug: 'algolia' },
        { name: 'Postgres', type: 'db', techId: 'postgres', slug: 'postgres' },
        { name: 'SQS', type: 'messaging', techId: 'aws.sqs', slug: 'sqs' },
        { name: 'Billing', type: 'project', techId: null, slug: 'billing' },
      ],
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
        links: [{ title: 'Github', url: 'https://github.com/specfy/specfy' }],
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
      components: [
        { name: 'GCP', type: 'hosting', techId: 'gcp', slug: 'gcp' },
        { name: 'GCE', type: 'hosting', techId: 'gcp.gce', slug: 'gce' },
        { name: 'Aggregator', type: 'service', techId: null, slug: 'aggr' },
        { name: 'Algolia', type: 'saas', techId: 'algolia', slug: 'algolia' },
        { name: 'Postgres', type: 'db', techId: 'postgres', slug: 'postgres' },
        { name: 'SQS', type: 'messaging', techId: 'aws.sqs', slug: 'sqs' },
        { name: 'Billing', type: 'project', techId: null, slug: 'billing' },
      ],
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
