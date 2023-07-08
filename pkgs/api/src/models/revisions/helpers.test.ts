/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type { Orgs, Projects } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { getBlobComponent } from '../../test/seed/components.js';

import { computeRelationsToProjects } from './helpers.js';

describe('computeRelationsToProjects', () => {
  const org = { id: 'org' } as Orgs;
  const project1 = { id: 'project1' } as Projects;
  const project2 = { id: 'project2' } as Projects;

  it('should output nothing', () => {
    const relations = computeRelationsToProjects({ components: [] });
    expect(relations).toStrictEqual({});
  });

  it('should output relation to', () => {
    const comp = getBlobComponent(org, project1);

    const relations = computeRelationsToProjects({
      components: [
        {
          ...comp,
          type: 'project',
          typeId: project2.id,
        },
        {
          ...getBlobComponent(org, project1),
          edges: [
            {
              portSource: 'sb',
              portTarget: 'tb',
              target: comp.id,
              read: true,
              write: false,
              vertices: [],
            },
          ],
        },
      ],
    });

    expect(relations).toStrictEqual({
      project2: {
        from: {
          read: false,
          write: false,
        },
        to: {
          read: true,
          write: false,
        },
      },
    });
  });

  it('should output relation from', () => {
    const comp = getBlobComponent(org, project1);

    const relations = computeRelationsToProjects({
      components: [
        {
          ...getBlobComponent(org, project1),
          type: 'project',
          typeId: project2.id,
          edges: [
            {
              portSource: 'sb',
              portTarget: 'tb',
              target: comp.id,
              read: true,
              write: true,
              vertices: [],
            },
          ],
        },
        comp,
      ],
    });

    expect(relations).toStrictEqual({
      project2: {
        from: {
          read: true,
          write: true,
        },
        to: {
          read: false,
          write: false,
        },
      },
    });
  });

  it('should output one relations from', () => {
    const comp1 = getBlobComponent(org, project1);
    const comp2 = getBlobComponent(org, project1);

    const relations = computeRelationsToProjects({
      components: [
        {
          ...comp1,
          type: 'project',
          typeId: project2.id,
        },
        {
          ...comp2,
          type: 'project',
          typeId: project2.id,
        },
        {
          ...getBlobComponent(org, project1),
          edges: [
            {
              portSource: 'sb',
              portTarget: 'tb',
              target: comp1.id,
              read: true,
              write: false,
              vertices: [],
            },
            {
              portSource: 'sb',
              portTarget: 'tb',
              target: comp2.id,
              read: false,
              write: true,
              vertices: [],
            },
          ],
        },
      ],
    });

    expect(relations).toStrictEqual({
      project2: {
        from: {
          read: false,
          write: false,
        },
        to: {
          read: true,
          write: true,
        },
      },
    });
  });
});
