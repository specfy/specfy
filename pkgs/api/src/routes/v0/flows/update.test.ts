import type { Orgs, Projects, Users } from '@prisma/client';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';

import { prisma } from '../../../db/index.js';
import { createComponent } from '../../../models/components/model.js';
import { recomputeOrgGraph } from '../../../models/flows/helpers.rebuild.js';
import type { TestSetup } from '../../../test/each.js';
import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isSuccess, isValidationError } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { getBlobComponent } from '../../../test/seed/components.js';
import { seedProject } from '../../../test/seed/projects.js';
import {
  seedSimpleUser,
  seedWithOrg,
  seedWithOrgViewer,
  seedWithProject,
} from '../../../test/seed/seed.js';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

async function linkTwoProjects(
  org: Orgs,
  project: Projects,
  user: Users,
  project2: Projects
) {
  return await prisma.$transaction(async (tx) => {
    const a = await createComponent({
      data: {
        ...getBlobComponent(org, project),
      },
      user,
      tx,
    });
    const b = await createComponent({
      data: {
        ...getBlobComponent(org, project),
        type: 'project',
        typeId: project2.id,
        edges: [
          {
            portSource: 'sb',
            portTarget: 'tt',
            read: true,
            write: false,
            target: a.id,
            vertices: [],
          },
        ],
      },
      user,
      tx,
    });

    await recomputeOrgGraph({
      orgId: org.id,
      updates: {
        edges: {
          [`${project2.id}->${project.id}`]: {
            sourceHandle: 'st',
            targetHandle: 'tr',
          },
        },
        nodes: {},
      },
      tx,
    });

    return { a, b };
  });
}

describe('PATCH /flows/:flow_id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.patch('/0/flows/foobarfoobar');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.patch('/0/flows/foobarfoobar', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should not allow viewer', async () => {
    const { token, org } = await seedWithOrgViewer();
    const res = await t.fetch.patch(`/0/flows/${org.flowId}`, {
      token,
      Querystring: { org_id: org.id },
      Body: {} as any,
    });

    expect(res.statusCode).toBe(403);
  });

  it('should fail to update a flow with no nodes', async () => {
    const { token, org } = await seedWithOrg();
    const res = await t.fetch.patch(`/0/flows/${org.flowId}`, {
      token,
      Querystring: { org_id: org.id },
      Body: {
        updates: {
          edges: {},
          nodes: {
            id: {
              display: {
                pos: { x: 1, y: 2 },
                size: { width: 130, height: 40 },
              },
            },
          },
        },
      },
    });

    isValidationError(res.json);
    expect(res.json.error).toStrictEqual({
      code: 'validation_error',
      fields: {
        'updates.nodes.id': {
          code: 'unknown',
          message: 'Node does not exists',
          path: ['updates', 'nodes', 'id'],
        },
      },
      form: [],
    });
  });

  it('should patch a node display', async () => {
    const { token, org, project, user } = await seedWithProject();
    const project2 = await seedProject(user, org);
    await linkTwoProjects(org, project, user, project2);

    const res = await t.fetch.patch(`/0/flows/${org.flowId}`, {
      token,
      Querystring: { org_id: org.id },
      Body: {
        updates: {
          edges: {},
          nodes: {
            [project2.id]: {
              display: {
                pos: { x: 1, y: 2 },
                size: { width: 400, height: 400 },
              },
            },
          },
        },
      },
    });

    isSuccess(res.json);
    expect(res.json).toStrictEqual({
      data: { done: true },
    });

    // GET
    const get = await t.fetch.get(`/0/flows/${org.flowId}`, {
      token,
      Querystring: {
        org_id: org.id,
      },
    });
    isSuccess(get.json);
    expect(
      get.json.data.flow.nodes.find((node) => node.id === project2.id)?.data
        .originalSize
    ).toStrictEqual({
      width: 400,
      height: 400,
    });
  });

  it('should patch an edge', async () => {
    const { token, org, project, user } = await seedWithProject();
    const project2 = await seedProject(user, org);
    await linkTwoProjects(org, project, user, project2);

    const edgeId = `${project2.id}->${project.id}`;
    const res = await t.fetch.patch(`/0/flows/${org.flowId}`, {
      token,
      Querystring: { org_id: org.id },
      Body: {
        updates: {
          edges: {
            [edgeId]: {
              sourceHandle: 'sr',
              targetHandle: 'tl',
            },
          },
          nodes: {},
        },
      },
    });

    isSuccess(res.json);
    expect(res.json).toStrictEqual({
      data: { done: true },
    });

    // GET
    const get = await t.fetch.get(`/0/flows/${org.flowId}`, {
      token,
      Querystring: {
        org_id: org.id,
      },
    });
    isSuccess(get.json);
    expect(
      get.json.data.flow.edges.find((edge) => edge.id === edgeId)
    ).toMatchObject({
      sourceHandle: 'sr',
      targetHandle: 'tl',
    });
  });
});
