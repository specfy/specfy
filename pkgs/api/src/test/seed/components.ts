import { nanoid } from '@specfy/core';
import type { Components, Orgs, Projects, Users } from '@specfy/db';
import { prisma } from '@specfy/db';
import { recomputeOrgGraph, createComponent } from '@specfy/models';
import { getBlobComponent } from '@specfy/models/src/components/test.utils.js';

export type ResSeedComponents = {
  gcp: Components;
  api: Components;
  processor: Components;
  pg: Components;
  aggregator: Components;
  gce: Components;
};

/**
 * Seed Components
 */
export async function seedComponents(
  { o1 }: { o1: Orgs },
  {
    pDash,
    pAnalytics,
    pFront,
    pAPI,
    pBilling,
  }: {
    pDash: Projects;
    pAnalytics: Projects;
    pFront: Projects;
    pAPI: Projects;
    pBilling: Projects;
  },
  users: Users[]
): Promise<ResSeedComponents> {
  const res = await prisma.$transaction(
    async (tx) => {
      // Components
      const gcp = await createComponent({
        data: {
          id: 'jZDC3Lsc01',
          name: 'GCP',
          type: 'hosting',
          orgId: o1.id,
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
        user: users[0],
        tx,
      });

      const gce = await createComponent({
        data: {
          id: 'jZDC3Lsc02',
          name: 'GCE',
          type: 'hosting',
          orgId: o1.id,
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
        user: users[0],
        tx,
      });

      const kube = await createComponent({
        data: {
          id: 'jZDC3Lsc03',
          name: 'Kubernetes',
          type: 'hosting',
          orgId: o1.id,
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
        user: users[0],
        tx,
      });

      const vercel = await createComponent({
        data: {
          id: 'jZDC3Ls103',
          name: 'Vercel',
          type: 'hosting',
          orgId: o1.id,
          projectId: pAnalytics.id,
          techId: 'vercel',
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 2,
            pos: { x: 200, y: -100 },
            size: { width: 180, height: 80 },
          },
          techs: [],
          edges: [],
          inComponent: { id: null },
        },
        user: users[0],
        tx,
      });

      const pg = await createComponent({
        data: {
          id: 'jZDC3Lsc04',
          name: 'Postgresql',
          type: 'db',
          orgId: o1.id,
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
        user: users[0],
        tx,
      });

      const bq = await createComponent({
        data: {
          id: 'jZDC3Ls104',
          name: 'BigQuery',
          type: 'db',
          orgId: o1.id,
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
          source: 'github',
          sourceName: 'BigQuery',
          sourcePath: ['/package.json'],
        },
        user: users[0],
        tx,
      });

      const dd = await createComponent({
        data: {
          id: 'jZDC3Lsc05',
          name: 'Datadog',
          type: 'saas',
          orgId: o1.id,
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
        user: users[0],
        tx,
      });

      const sentry = await createComponent({
        data: {
          id: 'jZDC3Lsc06',
          name: 'Sentry',
          type: 'saas',
          orgId: o1.id,
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
        user: users[0],
        tx,
      });

      const algolia = await createComponent({
        data: {
          id: 'jZDC3Lsc07',
          name: 'Algolia',
          type: 'saas',
          orgId: o1.id,
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
        user: users[0],
        tx,
      });

      const redis = await createComponent({
        data: {
          id: 'jZDC3Lsc08',
          name: 'Redis',
          type: 'db',
          orgId: o1.id,
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
        user: users[0],
        tx,
      });

      const es = await createComponent({
        data: {
          id: 'jZDC3Lsc09',
          name: 'Elasticsearch',
          type: 'db',
          orgId: o1.id,
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
        user: users[5],
        tx,
      });

      const rabbit = await createComponent({
        data: {
          id: 'jZDC3Lsc10',
          name: 'RabbitMQ',
          type: 'messaging',
          orgId: o1.id,
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
        user: users[2],
        tx,
      });

      const dashboard = await createComponent({
        data: {
          id: 'jZDC3Lsc11',
          name: pDash.name,
          type: 'project',
          typeId: pDash.id,
          orgId: o1.id,
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
        user: users[4],
        tx,
      });

      const billing = await createComponent({
        data: {
          id: 'jZDC3Lsc99',
          name: pBilling.name,
          type: 'project',
          typeId: pBilling.id,
          orgId: o1.id,
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
        user: users[4],
        tx,
      });

      const api = await createComponent({
        data: {
          id: 'jZDC3Lsc12',
          name: 'API',
          type: 'service',
          orgId: o1.id,
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
            { id: 'AtlasDB' },
          ],
        },
        user: users[3],
        tx,
      });

      await createComponent({
        data: {
          id: 'jZDC3Lsc13',
          name: 'Frontend',
          type: 'service',
          orgId: o1.id,
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
        user: users[1],
        tx,
      });

      const aggregator = await createComponent({
        data: {
          id: 'jZDC3Lsc14',
          name: 'Aggregator',
          type: 'service',
          orgId: o1.id,
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
        user: users[2],
        tx,
      });

      const processor = await createComponent({
        data: {
          id: 'jZDC3Lsc15',
          name: 'Processor',
          type: 'service',
          orgId: o1.id,
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
        user: users[1],
        tx,
      });

      // --- Component in others Projects to create edges in Org graph
      const display = getBlobComponent(pDash).display;
      // Dashboard
      const p01 = await createComponent({
        data: {
          ...getBlobComponent(pDash),
          type: 'project',
          name: pAPI.name,
          typeId: pAPI.id,
        },
        user: users[4],
        tx,
      });
      const p02 = await createComponent({
        data: {
          ...getBlobComponent(pDash),
          type: 'project',
          name: pBilling.name,
          typeId: pBilling.id,
          display: {
            ...display,
            pos: { x: 270, y: 20 },
          },
        },
        user: users[4],
        tx,
      });
      await createComponent({
        data: {
          ...getBlobComponent(pDash),
          name: 'api',
          display: {
            ...display,
            pos: { x: 140, y: 65 },
          },
          edges: [
            {
              target: p01.id,
              read: true,
              write: false,
              vertices: [],
              portSource: 'sl',
              portTarget: 'tr',
            },
            {
              target: p02.id,
              read: true,
              write: false,
              vertices: [
                { x: -5, y: 60 },
                { x: -5, y: 110 },
              ],
              portSource: 'sl',
              portTarget: 'tl',
            },
          ],
        },
        user: users[4],
        tx,
      });

      // Frontend
      const p31 = await createComponent({
        data: {
          ...getBlobComponent(pFront),
          type: 'project',
          name: pDash.name,
          typeId: pDash.id,
        },
        user: users[4],
        tx,
      });
      await createComponent({
        data: {
          ...getBlobComponent(pFront),
          name: 'api',
          display: {
            ...display,
            pos: { x: 165, y: 35 },
          },
          edges: [
            {
              target: p31.id,
              read: true,
              write: true,
              vertices: [],
              portSource: 'sl',
              portTarget: 'tr',
            },
          ],
        },
        user: users[4],
        tx,
      });

      // Billing
      const p51 = await createComponent({
        data: {
          ...getBlobComponent(pBilling),
          name: 'api',
          display: {
            ...display,
            pos: { x: 165, y: 35 },
          },
        },
        user: users[4],
        tx,
      });
      await createComponent({
        data: {
          ...getBlobComponent(pBilling),
          type: 'project',
          name: pAnalytics.name,
          typeId: pAnalytics.id,
          edges: [
            {
              target: p51.id,
              read: false,
              write: true,
              vertices: [],
              portSource: 'sl',
              portTarget: 'tr',
            },
          ],
        },
        user: users[4],
        tx,
      });

      // API
      const pAPI1 = await createComponent({
        data: {
          ...getBlobComponent(pAPI),
          type: 'project',
          name: pAnalytics.name,
          typeId: pAnalytics.id,
        },
        user: users[4],
        tx,
      });
      await createComponent({
        data: {
          ...getBlobComponent(pAPI),
          name: 'API',
          display: {
            ...display,
            pos: { x: 165, y: 35 },
          },
          edges: [
            {
              target: pAPI1.id,
              read: true,
              write: true,
              vertices: [],
              portSource: 'sl',
              portTarget: 'tr',
            },
          ],
        },
        user: users[4],
        tx,
      });

      await recomputeOrgGraph({
        orgId: o1.id,
        updates: {
          edges: {
            'b03tMzwd5A->b01tMzwd5A': {
              sourceHandle: 'sl',
              targetHandle: 'tr',
            },
            'b03tMzwd5A->b05tMzwd5A': {
              sourceHandle: 'sl',
              targetHandle: 'tr',
            },
            'b04tMzwd5A->b03tMzwd5A': {
              sourceHandle: 'sr',
              targetHandle: 'tl',
            },
            'b01tMzwd5A->b04tMzwd5A': {
              sourceHandle: 'sl',
              targetHandle: 'tr',
            },
            'b01tMzwd5A->b05tMzwd5A': {
              sourceHandle: 'sl',
              targetHandle: 'tl',
            },
            'b02tMzwd5A->b01tMzwd5A': {
              sourceHandle: 'sl',
              targetHandle: 'tr',
            },
          },
          nodes: {},
        },
        tx,
      });

      return { api, gcp, processor, aggregator, pg, gce };
    },
    { timeout: 20000 }
  );

  return res;
}

export async function seedComponent(user: Users, org: Orgs, project: Projects) {
  const id = nanoid();
  const component = await createComponent({
    data: {
      id,
      name: `Component ${id}`,
      orgId: org.id,
      projectId: project.id,
      type: 'service',
      techId: null,
      edges: [],
      description: { type: 'doc', content: [] },
      display: {
        zIndex: 1,
        pos: { x: 20, y: 10 },
        size: { width: 130, height: 40 },
      },
      techs: [],
      inComponent: { id: null },
    },
    tx: prisma,
    user,
  });

  return component;
}
