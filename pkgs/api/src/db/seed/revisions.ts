import { nanoid } from '../../common/id';
import type { User } from '../../models';
import {
  Document,
  Component,
  Revision,
  RevisionBlob,
  TypeHasUser,
  Project,
} from '../../models';
import type { BlockLevelOne } from '../../types/api';

/**
 * Seed projects
 */
export async function seedRevisions(
  p1: Project,
  users: User[],
  rfcs: Record<string, Document>,
  components: Record<string, Component>
) {
  // --------------------------------------------------------
  // Update Project
  const projectRev = new Project({
    ...p1.toJSON(),
    name: 'Analytics V2',
    description: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { uid: 'UidC3Ls190' },
          content: [
            {
              type: 'text',
              text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
            },
            {
              type: 'text',
              text: ' Sed pharetra eros vel felis scelerisque pretium. ',
              marks: [{ type: 'code' }],
            },
            {
              type: 'text',
              text: 'Maecenas ac feugiat orci, a sodales lacus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent urna libero, convallis eu commodo id, iaculis aliquam arcu.',
            },
            { type: 'hardBreak', attrs: { uid: 'UidC3Ls191' } },
            {
              type: 'text',
              text: `Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In interdum egestas massa, sit amet auctor ipsum maximus in. `,
            },
          ],
        },
      ],
    },
  });
  const blob1 = await RevisionBlob.create({
    id: '00000000-0000-4000-0000-000000000000',
    orgId: 'company',
    projectId: p1.id,
    created: false,
    deleted: false,
    type: 'project',
    typeId: p1.id,
    parentId: p1.blobId,
    blob: projectRev.getJsonForBlob(),
  });

  // --------------------------------------------------------
  // Create component
  const componentRev = new Component({
    id: 'jZDC3Lsc99',
    name: 'PubSub',
    type: 'project',
    typeId: p1.id,
    orgId: 'company',
    projectId: p1.id,
    techId: 'pubsub',
    description: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { uid: nanoid() },
          content: [
            {
              type: 'text',
              text: `Suspendisse vel congue arcu. Sed id sagittis justo. Maecenas feugiat at turpis in iaculis. Quisque vel lectus dolor. Donec finibus interdum lectus, ac dictum nisl faucibus mattis. Curabitur a quam laoreet, feugiat nulla a, rutrum augue. Duis eu varius ex. Aliquam a iaculis mauris. Sed congue dui sed risus blandit, id aliquet est aliquet. Vestibulum bibendum felis in augue pretium, ac lacinia purus gravida. Donec sed lacus facilisis ante laoreet porta id sit amet nulla. Pellentesque efficitur tincidunt eros id posuere.`,
            },
          ],
        },
      ],
    },
    display: { zIndex: 3, pos: { x: 450, y: 90, width: 100, height: 32 } },
    inComponent: components.gce.id,
    tech: [],
    edges: [
      {
        to: components.api.id,
        read: false,
        write: true,
        vertices: [],
        portSource: 'left',
        portTarget: 'top',
      },
    ],
  });
  const blob2 = await RevisionBlob.create({
    orgId: 'company',
    projectId: p1.id,
    created: true,
    deleted: false,
    type: 'component',
    typeId: componentRev.id,
    parentId: null,
    blob: componentRev.getJsonForBlob(),
  });

  // Update component
  const edges: Component['edges'] = components.api.toJSON().edges;
  edges.shift(); // removes redis
  edges.push({
    to: componentRev.id,
    read: true,
    write: false,
    vertices: [],
    portSource: 'right',
    portTarget: 'left',
  });
  edges[0].write = false;
  const tech = ['golang', ...components.api.tech];
  tech.pop();
  const component2Rev = new Component({
    ...components.api.toJSON(),
    tech,
    description: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { uid: nanoid() },
          content: [
            {
              type: 'text',
              text: `Maecenas pharetra imperdiet nulla nec commodo.Duis eu varius ex. Aliquam a iaculis mauris. Sed congue dui sed risus blandit, id aliquet est aliquet. Vestibulum bibendum felis in augue pretium, ac lacinia purus gravida. Donec sed lacus facilisis ante laoreet porta id sit amet nulla. Pellentesque efficitur tincidunt eros id posuere.`,
            },
          ],
        },
      ],
    },
    inComponent: components.gce.id,
    display: { zIndex: 3, pos: { x: 450, y: 90, width: 140, height: 42 } },
    edges: edges,
  });
  const blob3 = await RevisionBlob.create({
    orgId: 'company',
    projectId: p1.id,
    created: false,
    deleted: false,
    type: 'component',
    typeId: components.api.id,
    parentId: components.api.blobId,
    blob: component2Rev.getJsonForBlob(),
  });

  // Delete component
  const blob4 = await RevisionBlob.create({
    orgId: 'company',
    projectId: p1.id,
    created: false,
    deleted: true,
    type: 'component',
    typeId: components.pg.id,
    parentId: components.pg.blobId,
    blob: null,
  });

  // --------------------------------------------------------
  // Create RFC
  const d2Rev = new Document({
    ...rfcs.d1.toJSON(),
    id: nanoid(),
    name: 'Use RabbitMQ to publish jobs',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          content: [{ type: 'text', text: 'Implementations Details' }],
          attrs: { level: 3, uid: nanoid() },
        },
        {
          type: 'paragraph',
          attrs: { uid: nanoid() },
          content: [
            {
              type: 'text',
              text: `Suspendisse vel congue arcu. Sed id sagittis justo. Maecenas feugiat at turpis in iaculis. Quisque vel lectus dolor. Donec finibus interdum lectus, ac dictum nisl faucibus mattis. Curabitur a quam laoreet, feugiat nulla a, rutrum augue. Duis eu varius ex. Aliquam a iaculis mauris. Sed congue dui sed risus blandit, id aliquet est aliquet. Vestibulum bibendum felis in augue pretium, ac lacinia purus gravida. Donec sed lacus facilisis ante laoreet porta id sit amet nulla. Pellentesque efficitur tincidunt eros id posuere.`,
            },
          ],
        },
      ],
    },
  });
  const blob5 = await RevisionBlob.create({
    orgId: 'company',
    projectId: p1.id,
    created: true,
    deleted: false,
    type: 'document',
    typeId: d2Rev.id,
    parentId: null,
    blob: d2Rev.getJsonForBlob(),
  });

  // Update RFC
  const content: BlockLevelOne[] = JSON.parse(
    JSON.stringify(rfcs.d1.content.content)
  );
  content[2] = {
    type: 'heading',
    content: [{ type: 'text', text: 'Goals' }],
    attrs: { level: 1, uid: content[2].attrs.uid },
  };
  delete content[6];
  delete content[10];
  content.splice(12, 0, {
    type: 'heading',
    content: [{ type: 'text', text: 'Implementations Details' }],
    attrs: { level: 1, uid: nanoid() },
  });
  const d1Rev = new Document({
    ...rfcs.d1.toJSON(),
    content: {
      type: 'doc',
      content: content.filter(Boolean),
    },
  });
  const blob6 = await RevisionBlob.create({
    orgId: 'company',
    projectId: p1.id,
    created: false,
    deleted: false,
    type: 'document',
    typeId: rfcs.d1.id,
    parentId: rfcs.d1.blobId,
    blob: d1Rev.getJsonForBlob(),
  });

  // Delete RFC
  const blob7 = await RevisionBlob.create({
    orgId: 'company',
    projectId: p1.id,
    created: false,
    deleted: true,
    type: 'document',
    typeId: rfcs.d2.id,
    parentId: rfcs.d2.blobId,
    blob: null,
  });

  // ----- Create revisions
  const rev = await Revision.create({
    id: '1oxA2sPxkR',
    orgId: 'company',
    projectId: p1.id,
    title: 'fix: update project, create component, delete RFC-2',
    description: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { uid: nanoid() },
          content: [
            {
              type: 'text',
              text: `Maecenas pharetra imperdiet nulla nec commodo.`,
            },
          ],
        },
      ],
    },
    status: 'waiting',
    merged: false,
    blobs: [
      blob1.id,
      blob2.id,
      blob3.id,
      blob4.id,
      blob5.id,
      blob6.id,
      blob7.id,
    ],
  });

  await TypeHasUser.create({
    revisionId: rev.id,
    userId: users[0].id,
    role: 'author',
  });
  await TypeHasUser.create({
    revisionId: rev.id,
    userId: users[1].id,
    role: 'reviewer',
  });
  await TypeHasUser.create({
    revisionId: rev.id,
    userId: users[2].id,
    role: 'reviewer',
  });
}
