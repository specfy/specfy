import { nanoid } from '@specfy/core';
import { prisma } from '@specfy/db';
import { createComponent, type ApiBlobCreateDocument } from '@specfy/models';
import { getBlobComponent } from '@specfy/models/src/components/test.utils.js';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import type { AnalyserJson } from '@specfy/stack-analyser';

import { setupBeforeAll, setupAfterAll } from '../../../test/each.js';
import { isError, isSuccess, isValidationError } from '../../../test/fetch.js';
import {
  shouldBeProtected,
  shouldEnforceBody,
  shouldNotAllowQueryParams,
} from '../../../test/helpers.js';
import { seedProject, seedSource } from '../../../test/seed/projects.js';
import {
  seedSimpleUser,
  seedWithOrgViewer,
  seedWithProject,
} from '../../../test/seed/seed.js';

import type { TestSetup } from '../../../test/each.js';

function getDefaultStack() {
  return {
    path: ['/'],
    tech: null,
    techs: [],
    inComponent: null,
    languages: {},
    edges: [],
    dependencies: [],
    reason: [],
    childs: [],
  };
}

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('POST /revisions/upload -- General', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/revisions/upload');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      // @ts-expect-error
      Querystring: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should enforce body validation', async () => {
    await shouldEnforceBody(t.fetch, '/0/revisions/upload', 'POST');
  });

  it('should not allow viewer', async () => {
    const { token, org, owner } = await seedWithOrgViewer();
    const project = await seedProject(owner, org);
    const source = await seedSource(project);
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      Body: {
        blobs: [{ path: '/Readme.md', content: 'Hello world\n' }],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        sourceId: source.id,
        source: 'github',
        stack: null,
        commit: null,
      },
    });

    expect(res.statusCode).toBe(403);
  });

  it('should handle no change', async () => {
    const { token, org, project } = await seedWithProject();
    const source = await seedSource(project);
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      Body: {
        blobs: [],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        sourceId: source.id,
        stack: null,
        commit: null,
      },
    });

    isError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json.error).toStrictEqual({
      code: 'cant_create',
      reason: 'no_diff',
    });
  });
});

describe('POST /revisions/upload -- Documents', () => {
  it('should create one revision', async () => {
    const { token, org, project } = await seedWithProject();
    const source = await seedSource(project);
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      Body: {
        blobs: [{ path: '/Readme.md', content: 'Hello world\n' }],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        sourceId: source.id,
        stack: null,
        commit: null,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json).toStrictEqual({
      data: {
        id: expect.any(String),
        stats: {
          docs: {
            created: 1,
            deleted: 0,
            modified: 0,
            unchanged: 0,
          },
        },
      },
    });

    // Get blobs
    const resBlobs = await t.fetch.get(
      `/0/revisions/${res.json.data.id}/blobs`,
      {
        token,
        Querystring: { org_id: org.id, project_id: project.id },
      }
    );

    isSuccess(resBlobs.json);
    expect(resBlobs.statusCode).toBe(200);
    expect(resBlobs.json.data).toStrictEqual([
      {
        deleted: false,
        id: expect.any(String),
        parentId: null,
        previous: null,
        type: 'document',
        typeId: expect.any(String),
        updatedAt: expect.any(String),
        created: true,
        createdAt: expect.any(String),
        current: {
          blobId: null,
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          id: expect.any(String),
          locked: false,
          name: 'Readme',
          orgId: org.id,
          parentId: null,
          projectId: project.id,
          slug: 'Readme',
          source: 'github',
          sourcePath: '/Readme.md',
          tldr: '',
          type: 'doc',
          typeId: null,
          format: 'pm',
          hash: expect.any(String),
          content: expect.any(String),
        },
      },
    ]);
  });

  it('should forbid to create root level', async () => {
    const { token, org, project } = await seedWithProject();
    const source = await seedSource(project);
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      Body: {
        blobs: [{ path: '/', content: 'Hello world\n' }],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        sourceId: source.id,
        stack: null,
        commit: null,
      },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toStrictEqual({
      'blobs.0.path': {
        code: 'invalid',
        message: 'Root level path ("/") is not allowed',
        path: ['blobs', 0, 'path'],
      },
    });
  });

  it('should create one revision with intermediate folder', async () => {
    const { token, org, project } = await seedWithProject();
    const source = await seedSource(project);
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      Body: {
        blobs: [{ path: '/folder/foobar.md', content: 'foobar\n' }],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        sourceId: source.id,
        stack: null,
        commit: null,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json).toStrictEqual({
      data: {
        id: expect.any(String),
        stats: {
          docs: {
            created: 2,
            deleted: 0,
            modified: 0,
            unchanged: 0,
          },
        },
      },
    });

    // Get blobs
    const resBlobs = await t.fetch.get(
      `/0/revisions/${res.json.data.id}/blobs`,
      {
        token,
        Querystring: { org_id: org.id, project_id: project.id },
      }
    );

    isSuccess(resBlobs.json);
    expect(resBlobs.statusCode).toBe(200);
    expect(resBlobs.json.data).toHaveLength(2);

    const one = resBlobs.json.data[0] as ApiBlobCreateDocument;
    const two = resBlobs.json.data[1] as ApiBlobCreateDocument;
    expect(one.current.parentId).toBeNull();
    expect(one.current.sourcePath).toBe('/folder');
    expect(two.current.parentId).toBe(one.current.id);
    expect(two.current.sourcePath).toBe('/folder/foobar.md');
  });

  it('should not create folder even unordered', async () => {
    const { token, org, project } = await seedWithProject();
    const source = await seedSource(project);
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      Body: {
        blobs: [
          { path: '/folder/readme.md', content: 'index\n' },
          { path: '/folder', content: 'folder1\n' },
        ],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        sourceId: source.id,
        stack: null,
        commit: null,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json).toStrictEqual({
      data: {
        id: expect.any(String),
        stats: {
          docs: {
            created: 2,
            deleted: 0,
            modified: 0,
            unchanged: 0,
          },
        },
      },
    });

    // Get blobs
    const resBlobs = await t.fetch.get(
      `/0/revisions/${res.json.data.id}/blobs`,
      {
        token,
        Querystring: { org_id: org.id, project_id: project.id },
      }
    );

    isSuccess(resBlobs.json);
    expect(resBlobs.statusCode).toBe(200);
    expect(resBlobs.json.data).toHaveLength(2);

    const one = resBlobs.json.data[0] as ApiBlobCreateDocument;
    const two = resBlobs.json.data[1] as ApiBlobCreateDocument;
    expect(one.current.parentId).toBeNull();
    expect(one.current.sourcePath).toBe('/folder');
    expect(two.current.parentId).toBe(one.current.id);
    expect(two.current.sourcePath).toBe('/folder/readme.md');
  });

  it('should not allow same path', async () => {
    const { token, org, project } = await seedWithProject();
    const source = await seedSource(project);
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      Body: {
        blobs: [
          { path: '/readme.md', content: 'folder1\n' },
          { path: '/readme.md', content: 'index\n' },
        ],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        sourceId: source.id,
        stack: null,
        commit: null,
      },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toStrictEqual({
      'blobs.1.path': {
        code: 'duplicate',
        message: 'Path already exists',
        path: ['blobs', 1, 'path'],
      },
    });
  });

  it('should disallow binary', async () => {
    const { token, org, project } = await seedWithProject();
    const source = await seedSource(project);
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      Body: {
        blobs: [
          {
            path: '/readme',
            content: Buffer.from('index\n') as unknown as string,
          },
        ],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        sourceId: source.id,
        stack: null,
        commit: null,
      },
    });

    isValidationError(res.json);
    expect(res.json.error.fields).toStrictEqual({
      'blobs.0.content': {
        code: 'invalid_type',
        message: 'Expected string, received object',
        path: ['blobs', 0, 'content'],
      },
    });
  });
});

describe('POST /revisions/upload -- Stack', () => {
  it('should validate stack', async () => {
    const { token, org, project } = await seedWithProject();
    const source = await seedSource(project);
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      Body: {
        blobs: [],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        sourceId: source.id,
        stack: {
          name: 'top',
        } as any,
        commit: null,
      },
    });

    isValidationError(res.json);
    expect(res.json).toMatchSnapshot();
  });

  it('should create one revision', async () => {
    const { token, org, project } = await seedWithProject();
    const source = await seedSource(project);
    const name = `test ${nanoid()}`;
    const stack: AnalyserJson = {
      id: '10uaaV0QPN2D',
      ...getDefaultStack(),
      name: 'root',
      path: ['/'],
      childs: [
        {
          id: '90uaaV0QPN2D',
          ...getDefaultStack(),
          name: 'redis',
          path: ['/analytics/docker-compose.yml'],
          tech: 'redis',
          dependencies: [['docker', 'redis', '8.0.0-alpine']],
        },
        {
          id: 'rjiySzaZm26h',
          name: '@specfy/test',
          path: ['/src/package.json'],
          tech: null,
          edges: [{ target: '90uaaV0QPN2D', read: true, write: true }],
          inComponent: null,
          childs: [],
          techs: ['express', 'nodejs', 'typescript'],
          languages: { JSON: 2, 'Jest Snapshot': 6, TypeScript: 56 },
          dependencies: [
            ['npm', '@sinonjs/fake-timers', '9.1.2'],
            ['npm', '@types/node-fetch', '2.6.2'],
            ['npm', '@types/uuid', '8.3.4'],
            ['npm', 'express', '4.17.3'],
            ['npm', 'nock', '13.2.9'],
            ['npm', 'node-fetch', '2.6.7'],
            ['npm', 'openapi-enforcer', 'latest'],
            ['npm', 'uuid', '8.3.2'],
          ],
          reason: [],
        },
      ],
    };
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      Body: {
        blobs: [],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        sourceId: source.id,
        stack,
        commit: null,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json).toStrictEqual({
      data: {
        id: expect.any(String),
        stats: {
          docs: {
            created: 0,
            deleted: 0,
            modified: 0,
            unchanged: 0,
          },
          stack: {
            created: 2,
            deleted: 0,
            modified: 0,
            unchanged: 0,
          },
        },
      },
    });

    // Expect stack to have been saved in DB
    const rev = await prisma.revisions.findUnique({
      where: { id: res.json.data.id },
    });
    expect(rev?.stack).toStrictEqual(stack);
  });

  it('should refuse same component twice', async () => {
    const { token, org, project } = await seedWithProject();
    const source = await seedSource(project);
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      Body: {
        blobs: [],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        sourceId: source.id,
        commit: null,
        stack: {
          id: '10uaaV0QPN2D',
          ...getDefaultStack(),
          name: 'root',
          path: ['/'],
          childs: [
            {
              id: '90uaaV0QPN2D',
              ...getDefaultStack(),
              name: 'redis',
              path: ['/analytics/docker-compose.yml'],
              tech: 'redis',
            },
            {
              id: '80AeEV0QzMeR',
              ...getDefaultStack(),
              name: 'redis',
              path: ['/analytics/docker-compose.yml'],
              tech: 'redis',
            },
          ],
        },
      },
    });

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json.error.fields).toStrictEqual({
      'stack.childs.1': {
        code: 'exists',
        message:
          '80AeEV0QzMeR is already defined by 90uaaV0QPN2D (fingerprint: redis||redis||/analytics/docker-compose.yml)',
        path: ['stack', 'childs', 1],
      },
    });
  });

  it('should handle component with the same name but different', async () => {
    const { token, org, project } = await seedWithProject();
    const source = await seedSource(project);
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      Body: {
        blobs: [],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        sourceId: source.id,
        commit: null,
        stack: {
          id: '10uaaV0QPN2D',
          ...getDefaultStack(),
          name: 'root',
          path: ['/'],
          childs: [
            {
              id: '90uaaV0QPN2D',
              ...getDefaultStack(),
              name: 'API',
              path: ['/pkgs/api/package.json'],
            },
            {
              id: '80AeEV0QzMeR',
              ...getDefaultStack(),
              name: 'API',
              path: ['/cmd/api/main.go'],
            },
          ],
        },
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
  });

  it('should not recreate unmodified blob', async () => {
    const { token, org, project, user } = await seedWithProject();
    const source = await seedSource(project);
    const name = `test ${nanoid()}`;
    const comp = getBlobComponent(project);
    await createComponent({
      data: {
        ...comp,
        name: 'Redis',
        techId: 'redis',
        source: 'github',
        sourceName: 'redis',
        sourcePath: ['/docker-compose.yml'],
      },
      tx: prisma,
      user,
    });

    // Same body
    const res2 = await t.fetch.post('/0/revisions/upload', {
      token,
      Body: {
        blobs: [],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        sourceId: source.id,
        commit: null,
        stack: {
          id: nanoid(),
          name: 'root',
          ...getDefaultStack(),
          childs: [
            {
              id: nanoid(),
              ...getDefaultStack(),
              name: 'redis',
              tech: 'redis',
              path: ['/docker-compose.yml'],
            },
          ],
        },
      },
    });

    expect(res2.json).toStrictEqual({
      error: { code: 'cant_create', reason: 'no_diff' },
    });
  });
});

describe('POST /revisions/upload -- Git', () => {
  it.only('should index a commit', async () => {
    const { token, org, project, user } = await seedWithProject();
    const source = await seedSource(project);
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      Body: {
        blobs: [],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        sourceId: source.id,
        stack: null,
        commit: {
          info: {
            author: 'John Doe',
            date: new Date(),
            email: user.email,
            hash: nanoid(),
          },
          techs: ['foobar'],
        },
      },
    });

    // We have no diff but we still index the commit
    // Definitely not ideal DX
    isError(res.json);
    expect(res.json).toStrictEqual({
      error: { code: 'cant_create', reason: 'no_diff' },
    });

    // make sure it was indexed
    const resCatalog = await t.fetch.get('/0/catalog/foobar/user_activities', {
      token,
      Querystring: { org_id: org.id },
    });
    isSuccess(resCatalog.json);
    expect(resCatalog.statusCode).toBe(200);
    expect(resCatalog.json.data).toMatchObject({
      histogram: [{ count: 1, date: expect.any(Number) }],
      total: 1,
      totalForTech: 1,
      users: [
        {
          count: 1,
          type: 'guest',
        },
      ],
    });
  });
});
