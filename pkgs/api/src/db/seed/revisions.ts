import type { User } from '../../models';
import {
  Document,
  Component,
  Revision,
  RevisionBlob,
  TypeHasUser,
  Project,
} from '../../models';

/**
 * Seed projects
 */
export async function seedRevisions(
  p1: Project,
  users: User[],
  rfcs: Record<string, Document>
) {
  // Update Project
  const projectRev = new Project({
    ...p1.toJSON(),
    name: 'Analytics V2',
    description: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
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
            { type: 'hardBreak' },
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
    deleted: false,
    type: 'project',
    typeId: p1.id,
    parentId: p1.blobId,
    blob: projectRev.getJsonForBlob(),
  });

  // Create component
  const componentRev = new Component({
    id: 'jZDC3Lsc99',
    name: 'PubSub',
    type: 'project',
    typeId: p1.id,
    orgId: 'company',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 450, y: 90, width: 100, height: 32 } },
    inComponent: null,
    edges: [],
  });
  const blob2 = await RevisionBlob.create({
    orgId: 'company',
    projectId: p1.id,
    deleted: false,
    type: 'component',
    typeId: componentRev.id,
    parentId: null,
    blob: componentRev.getJsonForBlob(),
  });

  // Delete RFC
  const blob3 = await RevisionBlob.create({
    orgId: 'company',
    projectId: p1.id,
    deleted: true,
    type: 'document',
    typeId: rfcs.d2.id,
    parentId: rfcs.d2.blobId,
    blob: null,
  });

  // Update RFC
  const content = JSON.parse(JSON.stringify(rfcs.d1.content.content));
  content[2] = {
    type: 'heading',
    content: [{ type: 'text', text: 'Goals' }],
    attrs: { level: 1 },
  };
  const d1Rev = new Document({
    ...rfcs.d1.toJSON(),
    content: {
      type: 'doc',
      content: content,
    },
  });
  const blob4 = await RevisionBlob.create({
    orgId: 'company',
    projectId: p1.id,
    deleted: false,
    type: 'document',
    typeId: rfcs.d1.id,
    parentId: rfcs.d1.blobId,
    blob: d1Rev.getJsonForBlob(),
  });

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
    blobs: [blob1.id, blob2.id, blob3.id, blob4.id],
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
