import path from 'node:path';

import { dirname, nanoid } from '@specfy/core';
import { syncFolder } from '@specfy/github-sync';
import {
  createComponent,
  recomputeOrgGraph,
  createProject,
} from '@specfy/models';

import type { Orgs, Prisma, Users } from '@specfy/db';

export async function createDemo(
  tx: Prisma.TransactionClient,
  org: Orgs,
  user: Users
): Promise<void> {
  // ---- Dashboard
  const pDash = await createProject({
    data: {
      id: nanoid(),
      name: 'Dashboard',
      orgId: org.id,
      links: [],
      description: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { uid: nanoid() },
            content: [
              {
                type: 'text',
                text: 'This is the Dashboard project, it displays all the customers info. You should check Analytics project.',
              },
            ],
          },
        ],
      },
    },
    user,
    tx,
  });
  const aws = await createComponent({
    data: {
      id: nanoid(),
      name: 'AWS',
      type: 'hosting',
      orgId: org.id,
      projectId: pDash.id,
      techId: 'aws',
      description: { type: 'doc', content: [] },
      display: {
        zIndex: 1,
        pos: { x: -210, y: 20 },
        size: { width: 200, height: 80 },
      },
      techs: [],
      inComponent: { id: null },
      edges: [],
    },
    user,
    tx,
  });
  const s3 = await createComponent({
    data: {
      id: nanoid(),
      name: 'S3',
      type: 'storage',
      orgId: org.id,
      projectId: pDash.id,
      techId: 'aws.s3',
      description: { type: 'doc', content: [] },
      display: {
        zIndex: 1,
        pos: { x: 20, y: 20 },
        size: { width: 120, height: 40 },
      },
      techs: [],
      inComponent: { id: aws.id },
      edges: [],
    },
    user,
    tx,
  });
  await createComponent({
    data: {
      id: nanoid(),
      name: 'Backend',
      type: 'service',
      orgId: org.id,
      projectId: pDash.id,
      description: { type: 'doc', content: [] },
      display: {
        zIndex: 3,
        pos: { x: 50, y: 40 },
        size: { width: 130, height: 40 },
      },
      inComponent: { id: null },
      edges: [
        {
          target: s3.id,
          read: true,
          write: true,
          vertices: [],
          portSource: 'sl',
          portTarget: 'tr',
        },
      ],
      techs: [{ id: 'golang' }],
    },
    user,
    tx,
  });

  // ---- Analytics
  const pAnalytics = await createProject({
    data: {
      id: nanoid(),
      name: 'Analytics',
      orgId: org.id,
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
                text: `The project also employs machine learning and statistical methods to analyze data. This analysis helps in predicting trends and making recommendations based on past data. This project assists businesses in making data-based decisions.`,
              },
            ],
          },
        ],
      },
      links: [
        { title: 'GitHub', url: 'https://github.com/specfy' },
        { title: 'Discord', url: 'https://discord.gg/96cDXvT8NV' },
      ],
    },
    user,
    tx,
  });

  // ---- Billing
  const pBilling = await createProject({
    data: {
      id: nanoid(),
      name: 'Billing',
      orgId: org.id,
      links: [],
      description: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { uid: nanoid() },
            content: [
              {
                type: 'text',
                text: 'This is the Billing project, it compute what customers should pay. You should check Analytics project.',
              },
            ],
          },
        ],
      },
    },
    user,
    tx,
  });
  const stripe = await createComponent({
    data: {
      id: nanoid(),
      name: 'Stripe',
      type: 'saas',
      orgId: org.id,
      projectId: pBilling.id,
      techId: 'stripe',
      description: { type: 'doc', content: [] },
      display: {
        zIndex: 1,
        pos: { x: -16, y: -39 },
        size: { width: 120, height: 40 },
      },
      techs: [],
      inComponent: { id: null },
      edges: [],
    },
    user,
    tx,
  });
  await createComponent({
    data: {
      id: nanoid(),
      name: 'Backend',
      type: 'service',
      orgId: org.id,
      projectId: pBilling.id,
      description: { type: 'doc', content: [] },
      display: {
        zIndex: 3,
        pos: { x: 50, y: 40 },
        size: { width: 130, height: 40 },
      },
      inComponent: { id: null },
      edges: [
        {
          target: stripe.id,
          read: true,
          write: true,
          vertices: [],
          portSource: 'st',
          portTarget: 'tb',
        },
      ],
      techs: [{ id: 'rust' }],
    },
    user,
    tx,
  });

  // ------ Components for Analytics
  const gcp = await createComponent({
    data: {
      id: nanoid(),
      name: 'GCP',
      type: 'hosting',
      orgId: org.id,
      projectId: pAnalytics.id,
      techId: 'gcp',
      description: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { uid: nanoid() },
            content: [
              {
                type: 'text',
                text: 'GCP is hosting all our core services and is not currently managed manually by team, with Terraform. It was decided to use GCP to have access to BigQuery, also the team was more proficient with the tooling.',
              },
            ],
          },
        ],
      },
      display: {
        zIndex: 1,
        pos: { x: -210, y: 20 },
        size: { width: 610, height: 400 },
      },
      techs: [],
      inComponent: { id: null },
      edges: [],
    },
    user,
    tx,
  });

  const gce = await createComponent({
    data: {
      id: nanoid(),
      name: 'GCE',
      type: 'hosting',
      orgId: org.id,
      projectId: pAnalytics.id,
      techId: 'gcp.gce',
      description: { type: 'doc', content: [] },
      display: {
        zIndex: 2,
        pos: { x: 20, y: 220 },
        size: { width: 200, height: 80 },
      },
      techs: [],
      inComponent: { id: gcp.id },
      edges: [],
    },
    user,
    tx,
  });

  const kube = await createComponent({
    data: {
      id: nanoid(),
      name: 'Kubernetes',
      type: 'hosting',
      orgId: org.id,
      projectId: pAnalytics.id,
      techId: 'kubernetes',
      description: { type: 'doc', content: [] },
      display: {
        zIndex: 2,
        pos: { x: 270, y: 40 },
        size: { width: 290, height: 300 },
      },
      techs: [],
      inComponent: { id: gcp.id },
      edges: [],
    },
    user,
    tx,
  });

  const vercel = await createComponent({
    data: {
      id: nanoid(),
      name: 'Vercel',
      type: 'hosting',
      orgId: org.id,
      projectId: pAnalytics.id,
      techId: 'vercel',
      inComponent: { id: null },
      description: { type: 'doc', content: [] },
      display: {
        zIndex: 2,
        pos: { x: 200, y: -100 },
        size: { width: 180, height: 80 },
      },
      techs: [],
      edges: [],
    },
    user,
    tx,
  });

  const pg = await createComponent({
    data: {
      id: nanoid(),
      name: 'Postgresql',
      type: 'db',
      orgId: org.id,
      projectId: pAnalytics.id,
      techId: 'postgresql',
      description: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { uid: nanoid() },
            content: [
              {
                type: 'text',
                text: 'This database stores all the pipelines configuration, users info, jobs metadata, etc... This is the source of truth of the system, if it crashes or need to be restarted we can reboot from the state stored in database.',
              },
            ],
          },
        ],
      },
      display: {
        zIndex: 3,
        pos: { x: 20, y: 130 },
        size: { width: 130, height: 40 },
      },
      inComponent: { id: gcp.id },
      edges: [],
      techs: [],
    },
    user,
    tx,
  });

  const bq = await createComponent({
    data: {
      id: nanoid(),
      name: 'BigQuery',
      type: 'db',
      orgId: org.id,
      projectId: pAnalytics.id,
      techId: 'gcp.bigquery',
      description: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { uid: nanoid() },
            content: [
              {
                type: 'text',
                text: 'We store all computed metrics here. We are currently creating one table per day and keep a rolling 360days of metrics. ',
              },
              { type: 'hardBreak' },
              {
                type: 'text',
                text: 'Current table is backup hourly, with a final dump at 1:00 UTC. To be compliant with GDPR, when the retention period is over, the outdated tables and backups are wiped for ever.',
              },
            ],
          },
        ],
      },
      display: {
        zIndex: 3,
        pos: { x: 20, y: 320 },
        size: { width: 130, height: 40 },
      },
      inComponent: { id: gcp.id },
      edges: [],
      techs: [],
    },
    user,
    tx,
  });

  const dd = await createComponent({
    data: {
      id: nanoid(),
      name: 'Datadog',
      type: 'saas',
      orgId: org.id,
      projectId: pAnalytics.id,
      techId: 'datadog',
      description: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { uid: nanoid() },
            content: [
              {
                type: 'text',
                text: "We store all processing metrics and span here. Datadog is configured with a central agent, meaning it won't push servers metrics, those information can be found in Stackdriver.",
              },
            ],
          },
        ],
      },
      display: {
        zIndex: 3,
        pos: { x: 460, y: 260 },
        size: { width: 130, height: 40 },
      },
      inComponent: { id: null },
      edges: [],
      techs: [],
    },
    user,
    tx,
  });

  const sentry = await createComponent({
    data: {
      id: nanoid(),
      name: 'Sentry',
      type: 'saas',
      orgId: org.id,
      projectId: pAnalytics.id,
      techId: 'sentry',
      description: { type: 'doc', content: [] },
      display: {
        zIndex: 3,
        pos: { x: 450, y: 330 },
        size: { width: 130, height: 40 },
      },
      inComponent: { id: null },
      edges: [],
      techs: [],
    },
    user,
    tx,
  });

  const algolia = await createComponent({
    data: {
      id: nanoid(),
      name: 'Algolia',
      type: 'saas',
      orgId: org.id,
      projectId: pAnalytics.id,
      techId: 'algolia',
      description: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { uid: nanoid() },
            content: [
              {
                type: 'text',
                text: 'We use Algolia to store and search User and Pipeline information. This is more relevant and faster than using Postgres.',
              },
            ],
          },
        ],
      },
      display: {
        zIndex: 3,
        pos: { x: 480, y: -33 },
        size: { width: 130, height: 40 },
      },
      inComponent: { id: null },
      edges: [],
      techs: [],
    },
    user,
    tx,
  });

  const redis = await createComponent({
    data: {
      id: nanoid(),
      name: 'Redis',
      type: 'db',
      orgId: org.id,
      projectId: pAnalytics.id,
      techId: 'redis',
      description: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { uid: nanoid() },
            content: [
              {
                type: 'text',
                text: "Redis is used to store users' sessions and rate limit metrics.",
              },
            ],
          },
        ],
      },
      display: {
        zIndex: 3,
        pos: { x: 20, y: 60 },
        size: { width: 130, height: 40 },
      },
      inComponent: { id: gcp.id },
      edges: [],
      techs: [],
    },
    user,
    tx,
  });

  const es = await createComponent({
    data: {
      id: nanoid(),
      name: 'Elasticsearch',
      type: 'db',
      orgId: org.id,
      projectId: pAnalytics.id,
      techId: 'elasticsearch',
      description: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { uid: nanoid() },
            content: [
              {
                type: 'text',
                text: 'Elasticsearch is storing raw logs from the aggregation and processing. It is accessed by the Frontend through the API to display real-time metrics.',
              },
            ],
          },
        ],
      },
      display: {
        zIndex: 3,
        pos: { x: 20, y: 20 },
        size: { width: 150, height: 40 },
      },
      inComponent: { id: gce.id },
      edges: [],
      techs: [],
    },
    user,
    tx,
  });

  const rabbit = await createComponent({
    data: {
      id: nanoid(),
      name: 'RabbitMQ',
      type: 'messaging',
      orgId: org.id,
      projectId: pAnalytics.id,
      techId: 'rabbitmq',
      description: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { uid: nanoid() },
            content: [
              {
                type: 'text',
                text: 'This message queue is used to distribute metrics processing evenly across the infrastructure.',
              },
            ],
          },
        ],
      },
      display: {
        zIndex: 3,
        pos: { x: 100, y: 190 },
        size: { width: 130, height: 40 },
      },
      inComponent: { id: kube.id },
      edges: [],
      techs: [],
    },
    user,
    tx,
  });

  const dashboard = await createComponent({
    data: {
      id: nanoid(),
      name: pDash.name,
      type: 'project',
      typeId: pDash.id,
      orgId: org.id,
      projectId: pAnalytics.id,
      description: { type: 'doc', content: [] },
      display: {
        zIndex: 3,
        pos: { x: 480, y: 140 },
        size: { width: 130, height: 40 },
      },
      inComponent: { id: null },
      edges: [],
      techs: [],
    },
    user,
    tx,
  });

  const billing = await createComponent({
    data: {
      id: nanoid(),
      name: pBilling.name,
      type: 'project',
      typeId: pBilling.id,
      orgId: org.id,
      projectId: pAnalytics.id,
      description: { type: 'doc', content: [] },
      display: {
        zIndex: 3,
        pos: { x: 480, y: 80 },
        size: { width: 130, height: 40 },
      },
      inComponent: { id: null },
      edges: [],
      techs: [],
    },
    user,
    tx,
  });

  const api = await createComponent({
    data: {
      id: nanoid(),
      name: 'API',
      type: 'service',
      orgId: org.id,
      projectId: pAnalytics.id,
      description: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { uid: nanoid() },
            content: [
              {
                type: 'text',
                text: "The API is serving request to the Frontend. It's the central piece that also allows Users to control and monitor their metrics pipeline.",
              },
              { type: 'hardBreak' },
              {
                type: 'text',
                text: "It's also reaching internal Billing and Dashboard uses it to display status to the end customers, be careful when making breaking changes",
              },
            ],
          },
        ],
      },
      display: {
        zIndex: 3,
        pos: { x: 50, y: 40 },
        size: { width: 130, height: 40 },
      },
      inComponent: { id: kube.id },
      edges: [
        {
          target: redis.id,
          read: true,
          write: true,
          vertices: [],
          portSource: 'sl',
          portTarget: 'tr',
        },
        {
          target: pg.id,
          read: true,
          write: true,
          vertices: [],
          portSource: 'sl',
          portTarget: 'tr',
        },
        {
          target: dashboard.id,
          read: true,
          write: false,
          vertices: [],
          portSource: 'sr',
          portTarget: 'tl',
        },
        {
          target: billing.id,
          read: false,
          write: true,
          vertices: [],
          portSource: 'sr',
          portTarget: 'tl',
        },
        {
          target: es.id,
          read: true,
          write: true,
          vertices: [
            { x: 160, y: 180 },
            { x: 110, y: 300 },
          ],
          portSource: 'sl',
          portTarget: 'tr',
        },
        {
          target: dd.id,
          read: false,
          write: true,
          vertices: [],
          portSource: 'sr',
          portTarget: 'tl',
        },
        {
          target: sentry.id,
          read: false,
          write: true,
          vertices: [],
          portSource: 'sr',
          portTarget: 'tl',
        },
        {
          target: algolia.id,
          read: true,
          write: true,
          vertices: [{ x: 400, y: 280 }],
          portSource: 'sr',
          portTarget: 'tl',
        },
      ],
      techs: [
        { id: 'nodejs' },
        { id: 'typescript' },
        { id: 'bash' },
        { id: 'prisma' },
      ],
    },
    user,
    tx,
  });

  await createComponent({
    data: {
      id: nanoid(),
      name: 'Frontend',
      type: 'service',
      orgId: org.id,
      projectId: pAnalytics.id,
      description: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { uid: nanoid() },
            content: [
              {
                type: 'text',
                text: 'The Frontend, often referred to Admin or Dashboard in the documentation, displays the pipeline current state, allows Users to fine-tune the aggregation and processing.',
              },
            ],
          },
        ],
      },
      display: {
        zIndex: 4,
        pos: { x: 20, y: 20 },
        size: { width: 130, height: 40 },
      },
      inComponent: { id: vercel.id },
      edges: [
        {
          target: api.id,
          read: true,
          write: true,
          vertices: [],
          portSource: 'sb',
          portTarget: 'tt',
        },
        {
          target: algolia.id,
          read: true,
          write: false,
          vertices: [{ x: 390, y: 270 }],
          portSource: 'sr',
          portTarget: 'tl',
        },
      ],
      techs: [{ id: 'react' }, { id: 'typescript' }, { id: 'webpack' }],
    },
    user,
    tx,
  });

  await createComponent({
    data: {
      id: nanoid(),
      name: 'Aggregator',
      type: 'service',
      orgId: org.id,
      projectId: pAnalytics.id,
      description: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { uid: nanoid() },
            content: [
              {
                type: 'text',
                text: 'This service buffer all metrics coming from external services and create rolling aggregation.',
              },
            ],
          },
        ],
      },
      display: {
        zIndex: 3,
        pos: { x: 100, y: 125 },
        size: { width: 140, height: 40 },
      },
      inComponent: { id: kube.id },
      edges: [
        {
          target: pg.id,
          read: true,
          write: true,
          vertices: [],
          portSource: 'sl',
          portTarget: 'tr',
        },
        {
          target: rabbit.id,
          read: true,
          write: true,
          vertices: [],
          portSource: 'sb',
          portTarget: 'tt',
        },
        {
          target: es.id,
          read: true,
          write: true,
          vertices: [],
          portSource: 'sl',
          portTarget: 'tr',
        },
        {
          target: algolia.id,
          read: true,
          write: true,
          vertices: [],
          portSource: 'sr',
          portTarget: 'tl',
        },
        {
          target: dd.id,
          read: false,
          write: true,
          vertices: [],
          portSource: 'sr',
          portTarget: 'tl',
        },
        {
          target: sentry.id,
          read: false,
          write: true,
          vertices: [],
          portSource: 'sr',
          portTarget: 'tl',
        },
      ],
      techs: [{ id: 'nodejs' }, { id: 'typescript' }],
    },
    user,
    tx,
  });

  await createComponent({
    data: {
      id: nanoid(),
      name: 'Processor',
      type: 'service',
      orgId: org.id,
      projectId: pAnalytics.id,
      description: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            attrs: { uid: nanoid() },
            content: [
              {
                type: 'text',
                text: 'The Processor takes aggregated metrics from the Aggregator and compute avg, min, max, sum, count, etc.',
              },
            ],
          },
        ],
      },
      display: {
        zIndex: 3,
        pos: { x: 100, y: 250 },
        size: { width: 130, height: 40 },
      },
      inComponent: { id: kube.id },
      edges: [
        {
          target: pg.id,
          read: true,
          write: false,
          vertices: [],
          portSource: 'sl',
          portTarget: 'tr',
        },
        {
          target: rabbit.id,
          read: true,
          write: true,
          vertices: [],
          portSource: 'st',
          portTarget: 'tb',
        },
        {
          target: es.id,
          read: true,
          write: false,
          vertices: [],
          portSource: 'sl',
          portTarget: 'tr',
        },
        {
          target: dd.id,
          read: false,
          write: true,
          vertices: [],
          portSource: 'sr',
          portTarget: 'tl',
        },
        {
          target: sentry.id,
          read: false,
          write: true,
          vertices: [],
          portSource: 'sr',
          portTarget: 'tl',
        },
        {
          target: bq.id,
          read: false,
          write: true,
          vertices: [],
          portSource: 'sl',
          portTarget: 'tr',
        },
      ],
      techs: [{ id: 'nodejs' }, { id: 'typescript' }],
    },
    user,
    tx,
  });

  await recomputeOrgGraph({
    orgId: org.id,
    updates: {
      edges: {
        [`${pAnalytics.id}->${pDash.id}`]: {
          sourceHandle: 'sl',
          targetHandle: 'tr',
        },
        [`${pAnalytics.id}->${pBilling.id}`]: {
          sourceHandle: 'sl',
          targetHandle: 'tr',
        },
      },
      nodes: {
        [pDash.id]: {
          display: {
            pos: { x: 20, y: 10 },
            size: { width: 130, height: 40 },
          },
        },
        [pAnalytics.id]: {
          display: {
            pos: { x: 200, y: 70 },
            size: { width: 130, height: 40 },
          },
        },
        [pBilling.id]: {
          display: {
            pos: { x: 0, y: 120 },
            size: { width: 130, height: 40 },
          },
        },
      },
    },
    tx,
  });

  // --- Upload fixtures with sync to emulate an actual upload
  const fixturePath = path.join(dirname, '../../', '_demo_content');
  await syncFolder(fixturePath, pAnalytics as any, user, tx);
}
