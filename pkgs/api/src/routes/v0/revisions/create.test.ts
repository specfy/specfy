import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { nanoid } from '../../../common/id';
import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess, isValidationError } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldEnforceBody,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { getBlobComponent, seedComponent } from '../../../test/seed/components';
import { getBlobProject } from '../../../test/seed/projects';
import { seedWithProject } from '../../../test/seed/seed';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

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
    const blob = getBlobComponent(org, project);

    const res = await t.fetch.post('/0/revisions', {
      token,
      body: {
        blobs: [
          {
            type: 'component',
            typeId: blob.id,
            created: true,
            deleted: false,
            parentId: null,
            current: blob,
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
    const blob = getBlobComponent(org, project);

    const res = await t.fetch.post('/0/revisions', {
      token,
      body: {
        blobs: [
          {
            type: 'component',
            typeId: blob.id,
            created: true,
            deleted: true,
            parentId: null,
            current: blob,
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

  it('should disallow deleted with a blob', async () => {
    const { token, org, project, user } = await seedWithProject();

    // Create a component
    const component = await seedComponent(user, org, project);
    const blob = { ...getBlobComponent(org, project), id: component.id };

    const name = `test ${nanoid()}`;

    const res = await t.fetch.post('/0/revisions', {
      token,
      body: {
        blobs: [
          {
            type: 'component',
            typeId: blob.id,
            created: false,
            deleted: true,
            parentId: component.blobId,
            current: blob,
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
    const blob = getBlobComponent(org, project);

    const res = await t.fetch.post('/0/revisions', {
      token,
      body: {
        blobs: [
          {
            type: 'component',
            typeId: blob.id,
            created: true,
            deleted: false,
            parentId: null,
            current: {
              ...blob,
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
    const blob = getBlobProject(org);

    const res = await t.fetch.post('/0/revisions', {
      token,
      body: {
        blobs: [
          {
            type: 'project',
            typeId: blob.id,
            created: true,
            deleted: false,
            parentId: null,
            current: blob,
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
});
