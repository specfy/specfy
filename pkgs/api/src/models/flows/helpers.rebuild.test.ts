/* eslint-disable @typescript-eslint/consistent-type-assertions */
import type { Orgs, Projects } from '@specfy/db';
import { describe, expect, it } from 'vitest';

import { getBlobComponent } from '../../test/seed/components.js';

import { computeRelationsToProjects, rebuildFlow } from './helpers.rebuild.js';

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

describe('rebuildFlow', () => {
  it('should create a new empty flow', () => {
    const flow = rebuildFlow({
      projects: [],
      relations: {},
    });
    expect(flow).toStrictEqual({ nodes: [], edges: [] });
  });

  it('should create a new flow', () => {
    const flow = rebuildFlow({
      projects: [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
      ],
      relations: {
        a: {
          b: { read: true, write: true },
        },
      },
    });
    expect(flow).toMatchSnapshot();
  });

  it('should create a new flow with updates', () => {
    const flow = rebuildFlow({
      projects: [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
      ],
      relations: {
        a: {
          b: { read: true, write: true },
        },
      },
      updates: {
        edges: {
          'a->b': {
            sourceHandle: 'sb',
            targetHandle: 'tt',
          },
        },
        nodes: {},
      },
    });
    expect(flow.edges[0]).toMatchObject({
      sourceHandle: 'sb',
      targetHandle: 'tt',
    });
  });

  it('should update a flow', () => {
    const flowA = rebuildFlow({
      projects: [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
      ],
      relations: {
        a: {
          b: { read: true, write: true },
        },
      },
    });
    // Ensure default
    expect(flowA.edges[0]).toMatchObject({
      sourceHandle: 'sr',
      targetHandle: 'tl',
    });

    const flowB = rebuildFlow({
      oldFlow: flowA,
      projects: [
        { id: 'a', name: 'A' },
        { id: 'b', name: 'B' },
        { id: 'c', name: 'C' }, // Add a component
      ],
      relations: {
        a: {
          b: { read: true, write: true },
        },
        // Add a rel
        c: {
          a: { read: true, write: true },
        },
      },
      updates: {
        edges: {
          'a->b': {
            sourceHandle: 'sl',
            targetHandle: 'tr',
          },
        },
        nodes: {},
      },
    });
    expect(flowB.edges).toHaveLength(2);
    expect(flowB.nodes).toHaveLength(3);

    // Ensure update
    expect(flowB.edges[0]).toMatchObject({
      id: 'a->b',
      sourceHandle: 'sl',
      targetHandle: 'tr',
    });

    // Ensure default
    expect(flowB.edges[1]).toMatchObject({
      id: 'c->a',
      sourceHandle: 'sr',
      targetHandle: 'tl',
    });
  });
});
