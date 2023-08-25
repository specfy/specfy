import { describe, expect, it } from 'vitest';

import { aiPromptProjectDescription, aiPromptRewrite } from './prompt.js';

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
        { name: 'GCP', type: 'hosting', techId: 'gcp' },
        { name: 'GCE', type: 'hosting', techId: 'gcp.gce' },
        { name: 'Aggregator', type: 'service', techId: null },
        { name: 'Algolia', type: 'saas', techId: 'algolia' },
        { name: 'Postgres', type: 'db', techId: 'postgres' },
        { name: 'SQS', type: 'messaging', techId: 'aws.sqs' },
        { name: 'Billing', type: 'project', techId: null },
      ],
    });
    expect(res).toMatchSnapshot();
  });
});
