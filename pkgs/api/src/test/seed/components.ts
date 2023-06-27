import type { Components, Orgs, Projects, Users } from '@prisma/client';

import { nanoid } from '../../common/id.js';
import { slugify } from '../../common/string.js';
import { prisma } from '../../db/index.js';
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
  { p1, p3 }: { p1: Projects; p3: Projects },
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
          projectId: p1.id,
          techId: 'gcp',
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 1,
            pos: { x: -80, y: 20 },
            size: { width: 490, height: 370 },
          },
          tech: [],
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
          projectId: p1.id,
          techId: 'gce',
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 2,
            pos: { x: 20, y: 250 },
            size: { width: 150, height: 55 },
          },
          tech: [],
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
          projectId: p1.id,
          techId: 'kubernetes',
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 2,
            pos: { x: 200, y: 30 },
            size: { width: 240, height: 300 },
          },
          tech: [],
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
          type: 'component',
          orgId: o1.id,
          projectId: p1.id,
          techId: 'postgresql',
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 3,
            pos: { x: 20, y: 130 },
            size: { width: 100, height: 32 },
          },
          inComponent: gcp.id,
          edges: [],
          tech: [],
        },
        user: users[0],
        tx,
      });

      const dd = await createComponent({
        data: {
          id: 'jZDC3Lsc05',
          name: 'Datadog',
          type: 'thirdparty',
          orgId: o1.id,
          projectId: p1.id,
          techId: 'datadog',
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 3,
            pos: { x: 450, y: 190 },
            size: { width: 100, height: 32 },
          },
          inComponent: null,
          edges: [],
          tech: [],
        },
        user: users[0],
        tx,
      });

      const sentry = await createComponent({
        data: {
          id: 'jZDC3Lsc06',
          name: 'Sentry',
          type: 'thirdparty',
          orgId: o1.id,
          projectId: p1.id,
          techId: 'sentry',
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 3,
            pos: { x: 450, y: 250 },
            size: { width: 100, height: 32 },
          },
          inComponent: null,
          edges: [],
          tech: [],
        },
        user: users[0],
        tx,
      });

      const algolia = await createComponent({
        data: {
          id: 'jZDC3Lsc07',
          name: 'Algolia',
          type: 'thirdparty',
          orgId: o1.id,
          projectId: p1.id,
          techId: 'algolia',
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 3,
            pos: { x: 450, y: 310 },
            size: { width: 100, height: 32 },
          },
          inComponent: null,
          edges: [],
          tech: [],
        },
        user: users[0],
        tx,
      });

      const redis = await createComponent({
        data: {
          id: 'jZDC3Lsc08',
          name: 'Redis',
          type: 'component',
          orgId: o1.id,
          projectId: p1.id,
          techId: 'redis',
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 3,
            pos: { x: 20, y: 60 },
            size: { width: 100, height: 32 },
          },
          inComponent: gcp.id,
          edges: [],
          tech: [],
        },
        user: users[0],
        tx,
      });

      const es = await createComponent({
        data: {
          id: 'jZDC3Lsc09',
          name: 'Elasticsearch',
          type: 'component',
          orgId: o1.id,
          projectId: p1.id,
          techId: 'elasticsearch',
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 3,
            pos: { x: 20, y: 10 },
            size: { width: 100, height: 32 },
          },
          inComponent: gce.id,
          edges: [],
          tech: [],
        },
        user: users[5],
        tx,
      });

      const rabbit = await createComponent({
        data: {
          id: 'jZDC3Lsc10',
          name: 'RabbitMQ',
          type: 'component',
          orgId: o1.id,
          projectId: p1.id,
          techId: 'rabbitmq',
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 3,
            pos: { x: 100, y: 190 },
            size: { width: 100, height: 32 },
          },
          inComponent: kube.id,
          edges: [],
          tech: [],
        },
        user: users[2],
        tx,
      });

      const analytics = await createComponent({
        data: {
          id: 'jZDC3Lsc11',
          name: 'Dashboard',
          type: 'project',
          typeId: p3.id,
          orgId: o1.id,
          projectId: p1.id,
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 3,
            pos: { x: 450, y: 90 },
            size: { width: 100, height: 32 },
          },
          inComponent: null,
          edges: [],
          tech: [],
        },
        user: users[4],
        tx,
      });

      const api = await createComponent({
        data: {
          id: 'jZDC3Lsc12',
          name: 'API',
          type: 'component',
          orgId: o1.id,
          projectId: p1.id,
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
            size: { width: 100, height: 32 },
          },
          inComponent: kube.id,
          edges: [
            {
              to: redis.id,
              read: true,
              write: true,
              vertices: [],
              portSource: 'left',
              portTarget: 'right',
            },
            {
              to: pg.id,
              read: true,
              write: true,
              vertices: [],
              portSource: 'left',
              portTarget: 'right',
            },
            {
              to: analytics.id,
              read: true,
              write: false,
              vertices: [],
              portSource: 'right',
              portTarget: 'left',
            },
            {
              to: es.id,
              read: true,
              write: true,
              vertices: [
                { x: 160, y: 180 },
                { x: 110, y: 300 },
              ],
              portSource: 'left',
              portTarget: 'right',
            },
            {
              to: dd.id,
              read: false,
              write: true,
              vertices: [],
              portSource: 'right',
              portTarget: 'left',
            },
            {
              to: sentry.id,
              read: false,
              write: true,
              vertices: [],
              portSource: 'right',
              portTarget: 'left',
            },
            {
              to: algolia.id,
              read: true,
              write: true,
              vertices: [{ x: 400, y: 280 }],
              portSource: 'right',
              portTarget: 'left',
            },
          ],
          tech: ['nodejs', 'typescript', 'bash', 'AtlasDB'],
        },
        user: users[3],
        tx,
      });

      await createComponent({
        data: {
          id: 'jZDC3Lsc13',
          name: 'Frontend',
          type: 'component',
          orgId: o1.id,
          projectId: p1.id,
          description: { type: 'doc', content: [] },
          display: {
            zIndex: 4,
            pos: { x: 70, y: 10 },
            size: { width: 100, height: 32 },
          },
          inComponent: kube.id,
          edges: [
            {
              to: api.id,
              read: true,
              write: true,
              vertices: [],
              portSource: 'bottom',
              portTarget: 'top',
            },
            {
              to: algolia.id,
              read: true,
              write: false,
              vertices: [{ x: 390, y: 270 }],
              portSource: 'right',
              portTarget: 'left',
            },
            {
              to: sentry.id,
              read: false,
              write: true,
              vertices: [{ x: 400, y: 230 }],
              portSource: 'right',
              portTarget: 'left',
            },
          ],
          tech: ['react', 'typescript', 'webpack'],
        },
        user: users[1],
        tx,
      });

      const manager = await createComponent({
        data: {
          id: 'jZDC3Lsc14',
          name: 'Manager',
          type: 'component',
          orgId: o1.id,
          projectId: p1.id,
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
            size: { width: 100, height: 32 },
          },
          inComponent: kube.id,
          edges: [
            {
              to: pg.id,
              read: true,
              write: true,
              vertices: [],
              portSource: 'left',
              portTarget: 'right',
            },
            {
              to: rabbit.id,
              read: true,
              write: true,
              vertices: [],
              portSource: 'bottom',
              portTarget: 'top',
            },
            {
              to: es.id,
              read: true,
              write: true,
              vertices: [],
              portSource: 'left',
              portTarget: 'right',
            },
            {
              to: algolia.id,
              read: true,
              write: true,
              vertices: [],
              portSource: 'right',
              portTarget: 'left',
            },
            {
              to: dd.id,
              read: false,
              write: true,
              vertices: [],
              portSource: 'right',
              portTarget: 'left',
            },
            {
              to: sentry.id,
              read: false,
              write: true,
              vertices: [],
              portSource: 'right',
              portTarget: 'left',
            },
          ],
          tech: ['nodejs', 'typescript'],
        },
        user: users[2],
        tx,
      });

      const worker = await createComponent({
        data: {
          id: 'jZDC3Lsc15',
          name: 'Worker',
          type: 'component',
          orgId: o1.id,
          projectId: p1.id,
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
            size: { width: 100, height: 32 },
          },
          inComponent: kube.id,
          edges: [
            {
              to: pg.id,
              read: true,
              write: false,
              vertices: [],
              portSource: 'left',
              portTarget: 'right',
            },
            {
              to: rabbit.id,
              read: true,
              write: true,
              vertices: [],
              portSource: 'top',
              portTarget: 'bottom',
            },
            {
              to: es.id,
              read: true,
              write: false,
              vertices: [],
              portSource: 'left',
              portTarget: 'right',
            },
            {
              to: dd.id,
              read: false,
              write: true,
              vertices: [],
              portSource: 'right',
              portTarget: 'left',
            },
            {
              to: sentry.id,
              read: false,
              write: true,
              vertices: [],
              portSource: 'right',
              portTarget: 'left',
            },
          ],
          tech: ['nodejs', 'typescript'],
        },
        user: users[1],
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
      type: 'component',
      techId: null,
      edges: [],
      description: { type: 'doc', content: [] },
      display: {
        zIndex: 1,
        pos: { x: 20, y: 10 },
        size: { width: 100, height: 32 },
      },
      tech: [],
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
    type: 'component',
    typeId: null,
    orgId: org.id,
    projectId: project.id,
    blobId: null,
    techId: null,
    description: { type: 'doc', content: [] },
    display: {
      zIndex: 1,
      pos: { x: -80, y: 20 },
      size: { width: 490, height: 370 },
    },
    tech: [],
    inComponent: null,
    edges: [],
    source: null,
    sourceName: null,
    sourcePath: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
