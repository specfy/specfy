import type { Documents, Projects, Users } from '@prisma/client';

import { nanoid } from '../../common/id';
import { prisma } from '../../db';
import { createComponentBlob } from '../../models/component';
import { createDocumentBlob } from '../../models/document';
import { createProjectBlob } from '../../models/project';
import { createRevisionActivity } from '../../models/revision';
import type {
  BlockBanner,
  BlockLevelOne,
  BlockLevelZero,
} from '../../types/api';
import type { GraphEdge } from '../../types/db';

import type { ResSeedComponents } from './components';

/**
 * Seed projects
 */
export async function seedRevisions(
  { p1 }: { p1: Projects },
  users: Users[],
  rfcs: Record<string, Documents>,
  components: ResSeedComponents
) {
  const res = await prisma.$transaction(async (tx) => {
    // --------------------------------------------------------
    // Update Project
    const blob1 = await createProjectBlob({
      blob: {
        ...p1,
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
                // Split this line and add marks code
                {
                  type: 'text',
                  text: ' Sed pharetra eros vel felis scelerisque pretium. ',
                  marks: [{ type: 'code' }],
                },
                // Split this line
                {
                  type: 'text',
                  text: 'Maecenas ac feugiat orci, a sodales lacus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent urna libero, convallis eu commodo id, iaculis aliquam arcu.',
                },
                { type: 'hardBreak' },
                {
                  type: 'text',
                  text: `Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In interdum egestas massa, sit amet auctor ipsum maximus in. `,
                },
              ],
            },
          ],
        },
      },
      data: {
        id: nanoid(),
        orgId: 'company',
        projectId: p1.id,
        created: false,
        deleted: false,
        type: 'project',
        typeId: p1.id,
        parentId: p1.blobId,
      },
      tx,
    });

    // --------------------------------------------------------
    // Create component
    const blob2 = await createComponentBlob({
      data: { created: true },
      blob: {
        id: 'jZDC3Lsc99',
        name: 'PubSub',
        slug: 'pubsub',
        type: 'component',
        typeId: p1.id,
        blobId: '',
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
        display: { zIndex: 3, pos: { x: -10, y: 90, width: 100, height: 32 } },
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
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      tx,
    });

    // Update component
    const edges = components.api.edges as unknown as GraphEdge[];
    edges.shift(); // removes redis
    edges.shift(); // removes pg
    edges.push({
      to: blob2.typeId,
      read: true,
      write: false,
      vertices: [],
      portSource: 'right',
      portTarget: 'left',
    });
    edges[0].write = false;
    const tech = ['golang', ...(components.api.tech as string[])];
    tech.pop();

    const blob3 = await createComponentBlob({
      blob: {
        ...components.api,
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
        display: { zIndex: 3, pos: { x: 190, y: 110, width: 140, height: 42 } },
        edges: edges as any,
      },
      tx,
    });

    // Delete component
    const blob4 = await createComponentBlob({
      blob: components.pg,
      data: {
        deleted: true,
      },
      tx,
    });

    // --------------------------------------------------------
    // Create RFC
    const blob5 = await createDocumentBlob({
      blob: {
        ...rfcs.d1,
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
      },
      data: { created: true },
      tx,
    });

    // --Update RFC
    const content: BlockLevelOne[] = JSON.parse(
      JSON.stringify((rfcs.d1.content as unknown as BlockLevelZero).content)
    );

    // Modify title
    content[2] = {
      type: 'heading',
      content: [{ type: 'text', text: 'Goals' }],
      attrs: { level: 1, uid: content[2].attrs.uid },
    };

    // Modify text and hard hardbreak
    content[3] = {
      type: 'paragraph',
      attrs: { uid: 'UidgrRPV004' },
      content: [
        {
          type: 'text',
          text: 'Donec scelerisque ante felis gravida bibendum. Vestibulum quam purus, porta ac ornare sit amet, imperdiet at augue. Duis ac libero nec magna malesuada rhoncus at sit amet purus. Donec sed vulputate est. Donec accumsan ullamcorper auctor. Ut orci lectus, ornare id interdum sit amet, hendrerit et elit. Proin venenatis semper ipsum eget cursus. ',
        },
        { type: 'hardBreak' },
        {
          type: 'text',
          text: 'Aliquam nunc ante, sodales como eget egestas id, elementum et dui.',
        },
      ],
    };

    // Modify code
    content[11] = {
      type: 'codeBlock',
      attrs: { language: 'typescript', uid: 'UidgrRPV021' },
      content: [
        {
          type: 'text',
          text: 'function getDocuments(req: Req) {\n   const docs = await Document.findOne({\n     where: {\n      orgId: req.query.org_id,\n      slug: req.params.document_slug,\n     },\n   });\n\n   if (docs.length <= 0) {\n    return null;\n  }\n    \n  return docs.map((doc) => doc.id);\n}',
        },
      ],
    };

    // Modify attributes
    content[18] = {
      type: 'banner',
      attrs: { type: 'info', uid: 'UidgrRPV043' },
      content: (content[18] as BlockBanner).content,
    };
    delete content[6];
    delete content[10];
    content.splice(12, 0, {
      type: 'heading',
      content: [{ type: 'text', text: 'Implementations Details' }],
      attrs: { level: 1, uid: nanoid() },
    });
    const blob6 = await createDocumentBlob({
      blob: {
        ...rfcs.d1,
        content: {
          type: 'doc',
          content: content.filter(Boolean),
        } as any,
      },
      tx,
    });

    // Delete RFC
    const blob7 = await createDocumentBlob({
      blob: rfcs.d2,
      data: {
        deleted: true,
      },
      tx,
    });

    // ----- Create revisions
    const rev = await tx.revisions.create({
      data: {
        id: '1oxA2sPxkR',
        orgId: 'company',
        projectId: p1.id,
        name: 'fix: update project, create component, delete RFC-2',
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
      },
    });
    await createRevisionActivity(users[0], 'Revision.created', rev, tx);

    await tx.typeHasUsers.create({
      data: { revisionId: rev.id, userId: users[0].id, role: 'author' },
    });
    await tx.typeHasUsers.create({
      data: { revisionId: rev.id, userId: users[1].id, role: 'reviewer' },
    });
    await tx.typeHasUsers.create({
      data: { revisionId: rev.id, userId: users[2].id, role: 'reviewer' },
    });

    return rev;
  });

  return res;
}
