import type { Documents, Orgs, Projects, Users } from '@prisma/client';

import { nanoid } from '../../common/id.js';
import { prisma } from '../../db/index.js';
import {
  createComponentBlob,
  createDocumentBlob,
  createProjectBlob,
  createBlobs,
  createRevisionActivity,
  getTypeId,
} from '../../models/index.js';
import type {
  ApiBlobCreate,
  ApiRevision,
  BlockBanner,
  BlockLevelOne,
} from '../../types/api/index.js';

import type { ResSeedComponents } from './components.js';

/**
 * Seed projects
 */
export async function seedRevisions(
  { pAnalytics }: { pAnalytics: Projects },
  users: Users[],
  rfcs: Record<string, Documents>,
  components: ResSeedComponents
) {
  const res = await prisma.$transaction(async (tx) => {
    // --------------------------------------------------------
    // Update Project
    const blob1 = await createProjectBlob({
      blob: {
        ...pAnalytics,
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
      tx,
    });

    // --------------------------------------------------------
    // Create component
    const blob2 = await createComponentBlob({
      data: { created: true },
      blob: {
        id: 'jZDC3Lsc97',
        name: 'PubSub',
        slug: 'pubsub',
        type: 'messaging',
        typeId: pAnalytics.id,
        blobId: '',
        orgId: 'company',
        projectId: pAnalytics.id,
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
        display: {
          zIndex: 3,
          pos: { x: -10, y: 90 },
          size: { width: 130, height: 40 },
        },
        inComponent: components.gce.id,
        techs: [],
        edges: [
          {
            target: components.api.id,
            read: false,
            write: true,
            vertices: [],
            portSource: 'sl',
            portTarget: 'tt',
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      tx,
    });

    // Update component
    const edges = components.api.edges;
    edges.shift(); // removes redis
    edges.shift(); // removes pg
    edges.push({
      target: blob2.typeId,
      read: true,
      write: false,
      vertices: [],
      portSource: 'sr',
      portTarget: 'tl',
    });
    edges[0].write = false;
    const techs = ['golang', ...components.api.techs];
    techs.pop();

    const blob3 = await createComponentBlob({
      blob: {
        ...components.api,
        techs,
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
        display: {
          zIndex: 3,
          pos: { x: 190, y: 110 },
          size: { width: 140, height: 42 },
        },
        edges,
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
        blobId: null,
        typeId: await getTypeId({
          data: {
            orgId: pAnalytics.orgId,
            projectId: pAnalytics.id,
            type: 'rfc',
          },
          tx: prisma,
        }),
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
      JSON.stringify(rfcs.d1.content.content)
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
        },
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
        projectId: pAnalytics.id,
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
    await createRevisionActivity({
      user: users[0],
      action: 'Revision.created',
      target: rev,
      tx,
    });

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

export async function seedRevision(
  user: Users,
  org: Orgs,
  project: Projects,
  data?: Partial<ApiRevision>,
  blobs?: ApiBlobCreate[]
) {
  const id = nanoid();
  let blobIds: string[] = [];
  if (blobs) {
    blobIds = await createBlobs(blobs, prisma);
  }

  const revision = await prisma.revisions.create({
    data: {
      id,
      orgId: org.id,
      projectId: project.id,
      name: `fix: tests ${id}`,
      description: { type: 'doc', content: [] },
      status: data?.status || 'draft',
      merged: data?.merged || false,
      blobs: blobIds,
      closedAt: data?.status === 'closed' ? new Date() : null,
      mergedAt: data?.merged ? new Date() : null,
      locked: data?.locked || false,
    },
  });
  await createRevisionActivity({
    user,
    action: 'Revision.created',
    target: revision,
    tx: prisma,
  });
  await prisma.typeHasUsers.create({
    data: { revisionId: revision.id, userId: user.id, role: 'author' },
  });

  return revision;
}
