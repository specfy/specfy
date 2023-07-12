import type { Components, Orgs, Projects, Users } from '@prisma/client';

import { nanoid } from '../../common/id.js';
import { slugify } from '../../common/string.js';
import { prisma } from '../../db/index.js';
import { recomputeOrgGraph } from '../../models/flows/helpers.js';
import { createComponent } from '../../models/index.js';
import type { DBComponent } from '../../types/db/index.js';

export type ResSeedComponents = {
  gcp: Components;
  api: Components;
  worker: Components;
  pg: Components;
  manager: Components;
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
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 1,
            pos: { x: -80, y: 20 },
            size: { width: 490, height: 370 },
          },
          techs: [],
          inComponent: null,
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
          techId: 'gce',
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 2,
            pos: { x: 20, y: 250 },
            size: { width: 150, height: 55 },
          },
          techs: [],
          inComponent: gcp.id,
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
            pos: { x: 200, y: 30 },
            size: { width: 240, height: 300 },
          },
          techs: [],
          inComponent: gcp.id,
          edges: [],
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
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 3,
            pos: { x: 20, y: 130 },
            size: { width: 130, height: 40 },
          },
          inComponent: gcp.id,
          edges: [],
          techs: [],
        },
        user: users[0],
        tx,
      });

      const dd = await createComponent({
        data: {
          id: 'jZDC3Lsc05',
          name: 'Datadog',
          type: 'sass',
          orgId: o1.id,
          projectId: pAnalytics.id,
          techId: 'datadog',
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 3,
            pos: { x: 450, y: 190 },
            size: { width: 130, height: 40 },
          },
          inComponent: null,
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
          type: 'sass',
          orgId: o1.id,
          projectId: pAnalytics.id,
          techId: 'sentry',
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 3,
            pos: { x: 450, y: 250 },
            size: { width: 130, height: 40 },
          },
          inComponent: null,
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
          type: 'sass',
          orgId: o1.id,
          projectId: pAnalytics.id,
          techId: 'algolia',
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 3,
            pos: { x: 450, y: 310 },
            size: { width: 130, height: 40 },
          },
          inComponent: null,
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
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 3,
            pos: { x: 20, y: 60 },
            size: { width: 130, height: 40 },
          },
          inComponent: gcp.id,
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
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 3,
            pos: { x: 20, y: 10 },
            size: { width: 130, height: 40 },
          },
          inComponent: gce.id,
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
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 3,
            pos: { x: 100, y: 190 },
            size: { width: 130, height: 40 },
          },
          inComponent: kube.id,
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
            pos: { x: 450, y: 90 },
            size: { width: 130, height: 40 },
          },
          inComponent: null,
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
            pos: { x: 450, y: 40 },
            size: { width: 130, height: 40 },
          },
          inComponent: null,
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
                    text: 'Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo.',
                  },
                ],
              },
            ],
          },
          display: {
            zIndex: 3,
            pos: { x: 40, y: 70 },
            size: { width: 130, height: 40 },
          },
          inComponent: kube.id,
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
          techs: ['nodejs', 'typescript', 'bash', 'AtlasDB'],
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
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 4,
            pos: { x: 70, y: 10 },
            size: { width: 130, height: 40 },
          },
          inComponent: kube.id,
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
            {
              target: sentry.id,
              read: false,
              write: true,
              vertices: [{ x: 400, y: 230 }],
              portSource: 'sr',
              portTarget: 'tl',
            },
          ],
          techs: ['react', 'typescript', 'webpack'],
        },
        user: users[1],
        tx,
      });

      const manager = await createComponent({
        data: {
          id: 'jZDC3Lsc14',
          name: 'Manager',
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
                    text: 'Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo.',
                  },
                ],
              },
            ],
          },
          display: {
            zIndex: 3,
            pos: { x: 100, y: 130 },
            size: { width: 130, height: 40 },
          },
          inComponent: kube.id,
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
          techs: ['nodejs', 'typescript'],
        },
        user: users[2],
        tx,
      });

      const worker = await createComponent({
        data: {
          id: 'jZDC3Lsc15',
          name: 'Worker',
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
                    text: 'Maecenas pharetra imperdiet nulla nec commodo.',
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
          inComponent: kube.id,
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
          ],
          techs: ['nodejs', 'typescript'],
        },
        user: users[1],
        tx,
      });

      // --- Others to create some edes in Org graph
      const display = getBlobComponent(o1, pDash).display;
      // Dashboard
      const p01 = await createComponent({
        data: {
          ...getBlobComponent(o1, pDash),
          type: 'project',
          name: pAPI.name,
          typeId: pAPI.id,
        },
        user: users[4],
        tx,
      });
      const p02 = await createComponent({
        data: {
          ...getBlobComponent(o1, pDash),
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
          ...getBlobComponent(o1, pDash),
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
          ...getBlobComponent(o1, pFront),
          type: 'project',
          name: pDash.name,
          typeId: pDash.id,
        },
        user: users[4],
        tx,
      });
      await createComponent({
        data: {
          ...getBlobComponent(o1, pFront),
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
          ...getBlobComponent(o1, pBilling),
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
          ...getBlobComponent(o1, pBilling),
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
          ...getBlobComponent(o1, pAPI),
          type: 'project',
          name: pAnalytics.name,
          typeId: pAnalytics.id,
        },
        user: users[4],
        tx,
      });
      await createComponent({
        data: {
          ...getBlobComponent(o1, pAPI),
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

      return { api, gcp, worker, manager, pg, gce };
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
    },
    tx: prisma,
    user,
  });

  return component;
}

export function getBlobComponent(org: Orgs, project: Projects): DBComponent {
  const id = nanoid();
  const name = `test ${id}`;
  return {
    id,
    name,
    slug: slugify(name),
    type: 'service',
    typeId: null,
    orgId: org.id,
    projectId: project.id,
    blobId: null,
    techId: null,
    description: { type: 'doc', content: [] },
    display: {
      zIndex: 1,
      pos: { x: 0, y: 0 },
      size: { width: 130, height: 40 },
    },
    techs: [],
    inComponent: null,
    edges: [],
    source: null,
    sourceName: null,
    sourcePath: [],
    tags: [],
    show: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
