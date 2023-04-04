import type { Orgs, Projects } from '@prisma/client';
import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { nanoid } from '../../../common/id';
import { slugify } from '../../../common/string';
import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldEnforceBody,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedWithProject } from '../../../test/seed/seed';
import type { DBComponent, DBProject } from '../../../types/db';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

function blobComponent(
  id: string,
  name: string,
  org: Orgs,
  project: Projects
): DBComponent {
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
      pos: { x: -80, y: 20, width: 490, height: 370 },
    },
    tech: [],
    inComponent: null,
    edges: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
function blobProject(id: string, name: string, org: Orgs): DBProject {
  return {
    id,
    name,
    slug: slugify(name),
    blobId: null,
    orgId: org.id,
    links: [],
    edges: [],
    description: { type: 'doc', content: [] },
    display: {
      zIndex: 1,
      pos: { x: 220, y: -20, width: 100, height: 32 },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

describe('POST /revisions', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/revisions');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedWithProject();
    const res = await t.fetch.post('/0/revisions', {
      token,
      body: {
        blobs: [],
        description: { content: [], type: 'doc' },
        name: '',
        orgId: '',
        projectId: '',
      },
      // @ts-expect-error
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should enforce body validation', async () => {
    await shouldEnforceBody(t.fetch, '/0/revisions', 'POST');
  });

  it('should create one revision', async () => {
    const { token, org, project } = await seedWithProject();
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions', {
      token,
      body: {
        blobs: [],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json).toStrictEqual({
      id: expect.any(String),
    });
  });

  it('should reject invalid blob', async () => {
    const { token, org, project } = await seedWithProject();
    const name = `test ${nanoid()}`;

    const res = await t.fetch.post('/0/revisions', {
      token,
      body: {
        blobs: [
          {
            type: 'component',
            typeId: 'ere',
            created: false,
            parentId: null,
            // @ts-expect-error
            blob: {},
          },
        ],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
      },
    });

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
    expect(Object.keys(res.json.error.fields).length).toBeGreaterThan(10);
    expect(res.json.error.fields).toHaveProperty('blobs.0.deleted');
    expect(res.json.error.fields).toHaveProperty('blobs.0.blob.blobId');
  });

  it('should allow with new blob', async () => {
    const { token, org, project } = await seedWithProject();
    const name = `test ${nanoid()}`;
    const idComponent = nanoid();
    const nameComponent = `test ${idComponent}`;

    const res = await t.fetch.post('/0/revisions', {
      token,
      body: {
        blobs: [
          {
            type: 'component',
            typeId: idComponent,
            created: true,
            deleted: false,
            parentId: null,
            blob: blobComponent(idComponent, nameComponent, org, project),
          },
        ],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
  });

  it('should disallow created and deleted', async () => {
    const { token, org, project } = await seedWithProject();
    const name = `test ${nanoid()}`;
    const idComponent = nanoid();
    const nameComponent = `test ${idComponent}`;

    const res = await t.fetch.post('/0/revisions', {
      token,
      body: {
        blobs: [
          {
            type: 'component',
            typeId: idComponent,
            created: true,
            deleted: true,
            parentId: null,
            blob: blobComponent(idComponent, nameComponent, org, project),
          },
        ],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
      },
    });

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json.error.fields).toStrictEqual({
      'blobs.0': {
        code: 'incompatible_fields',
        message: 'Deleted and Created can not be both true',
        path: ['blobs', 0],
      },
    });
  });

  it('should disallow blob wrong org/project ', async () => {
    const { token, org, project } = await seedWithProject();
    const name = `test ${nanoid()}`;
    const idComponent = nanoid();
    const nameComponent = `test ${idComponent}`;

    const res = await t.fetch.post('/0/revisions', {
      token,
      body: {
        blobs: [
          {
            type: 'component',
            typeId: idComponent,
            created: true,
            deleted: false,
            parentId: null,
            blob: {
              ...blobComponent(idComponent, nameComponent, org, project),
              orgId: 'zriuzioruzo',
              projectId: 'zriuzioruzo',
            },
          },
        ],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
      },
    });

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json.error.fields).toStrictEqual({
      'blobs.0.orgId': {
        code: 'incompatible_fields',
        message:
          "Blob's content should be in the same org as the blob definition",
        path: ['blobs', 0, 'orgId'],
      },
      'blobs.0.projectId': {
        code: 'incompatible_fields',
        message:
          "Blob's content should be in the same project as the blob definition",
        path: ['blobs', 0, 'projectId'],
      },
    });
  });

  it('should disallow editing an other project ', async () => {
    const { token, org, project } = await seedWithProject();
    const name = `test ${nanoid()}`;
    const idComponent = nanoid();
    const nameComponent = `test ${idComponent}`;

    const res = await t.fetch.post('/0/revisions', {
      token,
      body: {
        blobs: [
          {
            type: 'project',
            typeId: idComponent,
            created: true,
            deleted: false,
            parentId: null,
            blob: blobProject(idComponent, nameComponent, org),
          },
        ],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
      },
    });

    isValidationError(res.json);
    expect(res.statusCode).toBe(400);
    expect(res.json.error.fields).toStrictEqual({
      'blobs.0.id': {
        code: 'incompatible_fields',
        message: 'Project blob can not be an other project',
        path: ['blobs', 0, 'id'],
      },
    });
  });

  // TODO:
});
