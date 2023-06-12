import { describe, beforeAll, it, afterAll, expect } from 'vitest';

import { nanoid } from '../../../common/id';
import type { TestSetup } from '../../../test/each';
import { setupBeforeAll, setupAfterAll } from '../../../test/each';
import { isSuccess } from '../../../test/fetch';
import {
  shouldBeProtected,
  shouldEnforceBody,
  shouldNotAllowQueryParams,
} from '../../../test/helpers';
import { seedSimpleUser, seedWithProject } from '../../../test/seed/seed';
import type { ApiBlobCreateDocument } from '../../../types/api';

let t: TestSetup;
beforeAll(async () => {
  t = await setupBeforeAll();
});

afterAll(async () => {
  await setupAfterAll(t);
});

describe('PATCH /revisions/:revision_id', () => {
  it('should be protected', async () => {
    const res = await t.fetch.post('/0/revisions/upload');
    await shouldBeProtected(res);
  });

  it('should not allow query params', async () => {
    const { token } = await seedSimpleUser();
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      // @ts-expect-error
      qp: { random: 'world' },
    });
    await shouldNotAllowQueryParams(res);
  });

  it('should enforce body validation', async () => {
    await shouldEnforceBody(t.fetch, '/0/revisions/upload', 'POST');
  });

  it('should create one revision', async () => {
    const { token, org, project } = await seedWithProject();
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      body: {
        blobs: [
          {
            path: '/',
            content: 'Hello world\n',
          },
        ],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        stack: null,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json).toStrictEqual({
      id: expect.any(String),
    });

    // Get blobs
    const resBlobs = await t.fetch.get(`/0/revisions/${res.json.id}/blobs`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });

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
          name: '',
          orgId: org.id,
          parentId: null,
          projectId: project.id,
          slug: '',
          source: 'github',
          sourcePath: '/',
          tldr: '',
          type: 'doc',
          typeId: null,
          content: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: {
                  uid: expect.any(String),
                },
                content: [
                  {
                    text: 'Hello world',
                    type: 'text',
                  },
                ],
              },
            ],
          },
        },
      },
    ]);
  });

  it('should create one revision with intermediate folder', async () => {
    const { token, org, project } = await seedWithProject();
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      body: {
        blobs: [
          {
            path: '/folder/foobar.md',
            content: 'foobar\n',
          },
        ],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        stack: null,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json).toStrictEqual({
      id: expect.any(String),
    });

    // Get blobs
    const resBlobs = await t.fetch.get(`/0/revisions/${res.json.id}/blobs`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });

    isSuccess(resBlobs.json);
    expect(resBlobs.statusCode).toBe(200);
    expect(resBlobs.json.data).toHaveLength(2);

    const one = resBlobs.json.data[0] as ApiBlobCreateDocument;
    const two = resBlobs.json.data[1] as ApiBlobCreateDocument;
    expect(one.current!.parentId).toBeNull();
    expect(one.current!.sourcePath).toBe('/folder/');
    expect(two.current!.parentId).toBe(one.current!.id);
    expect(two.current!.sourcePath).toBe('/folder/foobar.md');
  });

  it('should use index.md as intermediate folder if present', async () => {
    const { token, org, project } = await seedWithProject();
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      body: {
        blobs: [
          {
            path: '/folder/foobar.md',
            content: 'foobar\n',
          },
          {
            path: '/folder/index.md',
            content: 'index\n',
          },
        ],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        stack: null,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json).toStrictEqual({
      id: expect.any(String),
    });

    // Get blobs
    const resBlobs = await t.fetch.get(`/0/revisions/${res.json.id}/blobs`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });

    isSuccess(resBlobs.json);
    expect(resBlobs.statusCode).toBe(200);
    expect(resBlobs.json.data).toHaveLength(2);

    const one = resBlobs.json.data[0] as ApiBlobCreateDocument;
    const two = resBlobs.json.data[1] as ApiBlobCreateDocument;
    expect(one.current!.parentId).toBeNull();
    expect(one.current!.sourcePath).toBe('/folder/');
    expect(two.current!.parentId).toBe(one.current!.id);
    expect(two.current!.sourcePath).toBe('/folder/foobar.md');
  });

  it('should not use index.md if folder is specified', async () => {
    const { token, org, project } = await seedWithProject();
    const name = `test ${nanoid()}`;
    const res = await t.fetch.post('/0/revisions/upload', {
      token,
      body: {
        blobs: [
          {
            path: '/folder/',
            content: 'folder1\n',
          },
          {
            path: '/folder/index.md',
            content: 'index\n',
          },
        ],
        description: { content: [], type: 'doc' },
        name: name,
        orgId: org.id,
        projectId: project.id,
        source: 'github',
        stack: null,
      },
    });

    isSuccess(res.json);
    expect(res.statusCode).toBe(200);
    expect(res.json).toStrictEqual({
      id: expect.any(String),
    });

    // Get blobs
    const resBlobs = await t.fetch.get(`/0/revisions/${res.json.id}/blobs`, {
      token,
      qp: { org_id: org.id, project_id: project.id },
    });

    isSuccess(resBlobs.json);
    expect(resBlobs.statusCode).toBe(200);
    expect(resBlobs.json.data).toHaveLength(2);

    const one = resBlobs.json.data[0] as ApiBlobCreateDocument;
    const two = resBlobs.json.data[1] as ApiBlobCreateDocument;
    expect(one.current!.parentId).toBeNull();
    expect(one.current!.sourcePath).toBe('/folder/');
    expect(two.current!.parentId).toBe(one.current!.id);
    expect(two.current!.sourcePath).toBe('/folder/index.md');
  });
});