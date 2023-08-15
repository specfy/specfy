import fs from 'node:fs/promises';
import path from 'node:path';

import { nanoid, slugify, dirname } from '@specfy/core';
import type { Orgs, Projects, Users } from '@specfy/db';
import { prisma } from '@specfy/db';
import { createDocument, getDocumentTypeId } from '@specfy/models';
import type { DBDocument, ApiDocument } from '@specfy/models';

/**
 * Seed playbook
 */
export async function seedPlaybook(
  { o1 }: { o1: Orgs },
  { pAnalytics }: { pAnalytics: Projects },
  [u1]: Users[]
) {
  const res = await prisma.$transaction(async (tx) => {
    const d1 = await createDocument({
      user: u1,
      data: {
        id: 'd1grRPVYnx',
        orgId: o1.id,
        projectId: pAnalytics.id,
        type: 'pb',
        typeId: 1,
        tldr: '',
        name: 'SSH to Production',
        content: {
          content: [
            {
              type: 'codeBlock',
              attrs: {
                uid: 'UidgrRPV001',
                language: 'bash',
              },
              content: [
                {
                  type: 'text',
                  text: './connect.sh --quiet',
                },
              ],
            },
          ],
          type: 'doc',
        },
        locked: false,
      },
      tx,
    });

    const d2 = await createDocument({
      user: u1,
      tx,
      data: {
        id: 'd2grRPVYnx',
        orgId: o1.id,
        projectId: pAnalytics.id,
        type: 'pb',
        typeId: 2,
        tldr: '',
        name: 'Restart Production',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: {
                uid: 'UidgrRPV002',
              },
              content: [
                {
                  type: 'text',
                  text: 'Execute this command',
                },
              ],
            },
            {
              type: 'codeBlock',
              attrs: {
                uid: 'UidgrRPV003',
                language: 'bash',
              },
              content: [
                {
                  type: 'text',
                  text: './restart.sh --prod',
                },
              ],
            },
          ],
        },
        locked: false,
      },
    });

    const d3 = await createDocument({
      user: u1,
      tx,
      data: {
        id: 'd3grRPVYnx',
        orgId: o1.id,
        projectId: pAnalytics.id,
        type: 'pb',
        typeId: 3,
        tldr: '',
        name: 'Deploy',
        content: {
          content: [
            {
              type: 'paragraph',
              attrs: {
                uid: 'UidgrRPV004',
              },
              content: [
                {
                  type: 'text',
                  text: 'To deploy you first need to connect to production, deploy and then restart',
                },
              ],
            },
            {
              type: 'step',
              attrs: {
                uid: 'UidgrRPV005',
                stepId: 1,
              },
              content: [
                {
                  type: 'blockDocument',
                  attrs: { id: d1.id, uid: 'UidgrRPV006' },
                },
              ],
            },
            {
              type: 'step',
              attrs: { title: 'Build Docker', uid: 'UidgrRPV007', stepId: 2 },
              content: [
                {
                  type: 'codeBlock',
                  attrs: {
                    language: 'bash',
                    uid: 'UidgrRPV008',
                  },
                  content: [
                    {
                      type: 'text',
                      text: 'docker build  -f Dockerfile -t production .',
                    },
                  ],
                },
              ],
            },
            {
              type: 'step',
              attrs: {
                title: 'Push built docker image',
                uid: 'UidgrRPV009',
                stepId: 3,
              },
              content: [
                {
                  type: 'codeBlock',
                  attrs: {
                    language: 'bash',
                    uid: 'UidgrRPV010',
                  },
                  content: [
                    {
                      type: 'text',
                      text: 'docker push production',
                    },
                  ],
                },
              ],
            },
            {
              type: 'step',
              attrs: { uid: 'UidgrRPV011', stepId: 4 },
              content: [
                {
                  type: 'blockDocument',
                  attrs: { id: d2.id, uid: 'UidgrRPV012' },
                },
              ],
            },
            {
              type: 'step',
              attrs: { uid: 'UidgrRPV013', stepId: 5 },
              content: [
                {
                  type: 'blockDocument',
                  attrs: { id: 'd3grRPVYnx', uid: 'UidgrRPV014' }, // Circular ref
                },
              ],
            },
          ],
          type: 'doc',
        },
        locked: false,
      },
    });

    // Document has user
    await Promise.all(
      [d1, d2, d3].map(async (d) => {
        return tx.typeHasUsers.create({
          data: { documentId: d.id, userId: u1.id, role: 'author' },
        });
      })
    );
  });

  return res;
}

/**
 * Seed RFC
 */
export async function seedRFC(
  { o1 }: { o1: Orgs },
  { pAnalytics }: { pAnalytics: Projects },
  [u1, u2]: Users[]
) {
  // to avoid import it in tests too
  const docRfc4Json = JSON.parse(
    (
      await fs.readFile(
        path.join(dirname, '../', 'src/test/seed/document.rfc.json')
      )
    ).toString()
  );

  const res = await prisma.$transaction(async (tx) => {
    const d1 = await createDocument({
      user: u1,
      tx,
      data: {
        id: 'r1grRPVYnx',
        orgId: o1.id,
        projectId: pAnalytics.id,
        type: 'rfc',
        typeId: 1,
        name: 'API definition',
        tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              content: [{ type: 'text', text: 'Overview' }],
              attrs: { level: 1, uid: 'UidgrRPV001' },
            },
            {
              type: 'paragraph',
              attrs: { uid: 'UidgrRPV002' },
              content: [
                {
                  type: 'text',
                  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque aliquam eget nibh eu sodales. Donec bibendum eros at tincidunt aliquam. Praesent non ipsum in enim elementum posuere. Aenean pellentesque et velit quis pretium. Duis et ligula imperdiet, fermentum nulla et, viverra magna. Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula. Nunc eget blandit metus. Etiam interdum laoreet libero eu pharetra. Phasellus lobortis mauris posuere velit finibus, a ultrices neque faucibus. Maecenas laoreet varius quam. ',
                },
                {
                  type: 'text',
                  text: 'A link to a documentation',
                  marks: [
                    {
                      attrs: {
                        href: 'http://localhost:5173/company/analytics',
                        target: '_blank',
                        class: null,
                      },
                      type: 'link',
                    },
                  ],
                },
              ],
            },
            {
              type: 'heading',
              content: [{ type: 'text', text: 'Goals and Non-Goals' }],
              attrs: { level: 1, uid: 'UidgrRPV003' },
            },
            {
              type: 'paragraph',
              attrs: { uid: 'UidgrRPV004' },
              content: [
                {
                  type: 'text',
                  text: 'Donec scelerisque ante vel felis gravida bibendum. Vestibulum quam purus, porta ac ornare sit amet, imperdiet at augue. Duis ac libero nec magna malesuada rhoncus at sit amet purus. Donec sed vulputate est. Donec accumsan ullamcorper auctor. Ut orci lectus, ornare id interdum sit amet, hendrerit et elit. Proin venenatis semper ipsum eget cursus. ',
                },
                {
                  type: 'text',
                  text: 'Aliquam nunc ante, sodales eget egestas id, elementum et dui.',
                },
              ],
            },
            {
              type: 'bulletList',
              attrs: { uid: 'UidgrRPV005' },
              content: [
                {
                  type: 'listItem',
                  attrs: { uid: 'UidgrRPV006' },
                  content: [
                    {
                      type: 'paragraph',
                      attrs: { uid: 'UidgrRPV007' },
                      content: [
                        {
                          type: 'text',
                          text: 'lorem ipsum',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'listItem',
                  attrs: { uid: 'UidgrRPV008' },
                  content: [
                    {
                      type: 'paragraph',
                      attrs: { uid: 'UidgrRPV009' },
                      content: [
                        {
                          type: 'text',
                          text: 'dolor ',
                          marks: [{ type: 'bold' }],
                        },
                        {
                          type: 'text',
                          text: ' sit ',
                          marks: [{ type: 'bold' }, { type: 'italic' }],
                        },
                        {
                          type: 'text',
                          text: 'amet',
                          marks: [{ type: 'italic' }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'heading',
              content: [{ type: 'text', text: 'Background & Motivation' }],
              attrs: { level: 1, uid: 'UidgrRPV010' },
            },
            {
              type: 'image',
              attrs: {
                src: 'https://images.unsplash.com/photo-1687606746214-71885aa91e79?auto=format&fit=crop&w=800&q=400',
                alt: null,
                title: null,
                uid: 'UidgrRPV011',
              },
            },
            {
              type: 'paragraph',
              attrs: { uid: 'UidgrRPV012' },
              content: [
                {
                  type: 'text',
                  text: 'Pellentesque suscipit venenatis tellus vitae posuere. Donec at tellus ut ligula efficitur fermentum. Nam pharetra arcu et mattis porta. Aliquam vehicula quam non nisl tincidunt dignissim. Nunc egestas mi in ligula dignissim tristique. Vestibulum quis lacinia arcu. Fusce vehicula enim vitae erat feugiat, at laoreet tortor blandit.',
                },
              ],
            },
            {
              type: 'taskList',
              attrs: { uid: 'UidgrRPV013' },
              content: [
                {
                  type: 'taskItem',
                  attrs: { checked: true, uid: 'UidgrRPV014' },
                  content: [
                    {
                      type: 'paragraph',
                      attrs: { uid: 'UidgrRPV015' },
                      content: [{ type: 'text', text: 'A checked task.' }],
                    },
                  ],
                },
                {
                  type: 'taskItem',
                  attrs: { checked: false, uid: 'UidgrRPV016' },
                  content: [
                    {
                      type: 'paragraph',
                      attrs: { uid: 'UidgrRPV017' },
                      content: [{ type: 'text', text: 'Not done.' }],
                    },
                  ],
                },
              ],
            },
            {
              type: 'heading',
              content: [{ type: 'text', text: 'Implementations' }],
              attrs: { level: 1, uid: 'UidgrRPV018' },
            },
            {
              type: 'blockquote',
              attrs: { uid: 'UidgrRPV019' },
              content: [
                {
                  type: 'paragraph',
                  attrs: { uid: 'UidgrRPV020' },
                  content: [
                    {
                      text: '"This is a quote" -- Samuel Bodin, 2023',
                      type: 'text',
                    },
                  ],
                },
              ],
            },
            {
              type: 'codeBlock',
              attrs: { language: 'typescript', uid: 'UidgrRPV021' },
              content: [
                {
                  type: 'text',
                  text: 'function getDocument(req: Req) {\n   const docs = await Document.findOne({\n     where: {\n      orgId: req.query.org_id,\n      slug: req.params.document_slug,\n     },\n   });\n\n   if (docs.length <= 0) {\n    return null;\n  }\n    \n  return docs.map((doc) => doc.id);\n}',
                },
              ],
            },
            {
              type: 'paragraph',
              attrs: { uid: 'UidgrRPV022' },
              content: [
                {
                  type: 'text',
                  text: 'Phasellus orci ante, lobortis vel ullamcorper at, placerat eget leo. Pellentesque in nisi aliquam, rutrum nunc quis, bibendum velit. Etiam efficitur lacinia cursus. ',
                },
                {
                  type: 'text',
                  text: 'This is code.',
                  marks: [{ type: 'code' }],
                },
                {
                  type: 'text',
                  text: 'Duis neque nunc, consequat sit amet dignissim vel, semper a eros. Duis vel augue ut mauris molestie sodales nec id diam. Aenean blandit ornare nisl vitae venenatis. Ut accumsan ultricies lacinia. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Suspendisse potenti. Vestibulum ipsum dolor, rhoncus vel arcu non, sollicitudin eleifend quam. Fusce et nisi mi. Maecenas nisi quam, interdum at eros vitae, aliquam rutrum nunc. Praesent et pharetra dolor. Nam hendrerit nulla ex, vel lacinia ligula interdum a.',
                },
              ],
            },
            {
              type: 'heading',
              content: [{ type: 'text', text: 'Solutions' }],
              attrs: { level: 2, uid: 'UidgrRPV023' },
            },
            {
              type: 'vote',
              attrs: { voteId: 'Swq9qqgFXDA0', uid: 'UidgrRPV024' }, // TODO: fill this
              content: [
                {
                  type: 'voteItem',
                  attrs: { choiceId: 'Swq9qqgFXDA1', uid: 'UidgrRPV025' },
                  content: [
                    {
                      type: 'heading',
                      content: [{ type: 'text', text: '#1 Naive solution' }],
                      attrs: { level: 3, uid: 'UidgrRPV026' },
                    },
                    {
                      type: 'paragraph',
                      attrs: { uid: 'UidgrRPV027' },
                      content: [
                        {
                          type: 'text',
                          text: 'Praesent sodales lorem id diam pellentesque, quis tincidunt risus porttitor. Vivamus dapibus aliquet ipsum. Nullam non leo neque. Aliquam in enim id nulla elementum pretium. Nullam scelerisque quam ut mattis egestas. Ut semper eros ipsum, eget rutrum nisi consequat vitae. Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo. Nunc id tellus felis. Suspendisse dui massa, volutpat ac tincidunt eu, cursus eget metus. Proin vel viverra mi. Maecenas a finibus felis, et dapibus orci. Sed molestie sed ex vitae sodales. Vestibulum ut leo posuere nulla commodo iaculis.',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'voteItem',
                  attrs: { choiceId: 'Swq9qqgFXDA2', uid: 'UidgrRPV028' },
                  content: [
                    {
                      type: 'heading',
                      content: [
                        { type: 'text', text: '#2 Over-engineered solution' },
                      ],
                      attrs: { level: 3, uid: 'UidgrRPV029' },
                    },
                    {
                      type: 'paragraph',
                      attrs: { uid: 'UidgrRPV030' },
                      content: [
                        {
                          type: 'text',
                          text: 'Praesent sodales lorem id diam pellentesque, quis tincidunt risus porttitor. Vivamus dapibus aliquet ipsum. Nullam non leo neque. Aliquam in enim id nulla elementum pretium. Nullam scelerisque quam ut mattis egestas. Ut semper eros ipsum, eget rutrum nisi consequat vitae. Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo. Nunc id tellus felis. Suspendisse dui massa, volutpat ac tincidunt eu, cursus eget metus. Proin vel viverra mi. Maecenas a finibus felis, et dapibus orci. Sed molestie sed ex vitae sodales. Vestibulum ut leo posuere nulla commodo iaculis.',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'table',
              attrs: { uid: 'UidgrRPV031' },
              content: [
                {
                  type: 'tableRow',
                  attrs: { uid: 'UidgrRPV032' },
                  content: [
                    {
                      type: 'tableHeader',
                      attrs: {
                        colspan: 1,
                        rowspan: 1,
                        colwidth: [150],
                        uid: 'UidgrRPV033',
                      },
                      content: [
                        {
                          type: 'paragraph',
                          attrs: { uid: 'UidgrRPV034' },
                          content: [
                            {
                              type: 'text',
                              text: 'Name',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'tableHeader',
                      attrs: {
                        colspan: 1,
                        rowspan: 1,
                        colwidth: null,
                        uid: 'UidgrRPV035',
                      },
                      content: [
                        {
                          type: 'paragraph',
                          attrs: { uid: 'UidgrRPV036' },
                          content: [
                            {
                              type: 'text',
                              text: 'Description',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableRow',
                  attrs: { uid: 'UidgrRPV136' },
                  content: [
                    {
                      type: 'tableCell',
                      attrs: {
                        colspan: 1,
                        rowspan: 1,
                        colwidth: null,
                        uid: 'UidgrRPV037',
                      },
                      content: [
                        {
                          type: 'paragraph',
                          attrs: { uid: 'UidgrRPV038' },
                          content: [
                            {
                              type: 'text',
                              text: 'Samuel Bodin',
                            },
                          ],
                        },
                      ],
                    },
                    {
                      type: 'tableCell',
                      attrs: {
                        colspan: 1,
                        rowspan: 1,
                        colwidth: null,
                        uid: 'UidgrRPV039',
                      },
                      content: [
                        {
                          type: 'paragraph',
                          attrs: { uid: 'UidgrRPV040' },
                          content: [
                            {
                              type: 'text',
                              text: 'Amazing developer much wow',
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'horizontalRule',
              attrs: { uid: 'UidgrRPV041' },
            },
            {
              type: 'heading',
              content: [{ type: 'text', text: 'FAQ' }],
              attrs: { level: 1, uid: 'UidgrRPV042' },
            },
            {
              type: 'banner',
              attrs: { type: 'error', uid: 'UidgrRPV043' },
              content: [
                {
                  type: 'paragraph',
                  attrs: { uid: 'UidgrRPV044' },
                  content: [
                    {
                      type: 'text',
                      text: 'Ut semper eros ipsum, eget rutrum nisi consequat vitae.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'heading',
              content: [
                { type: 'text', text: 'What is this awesome website?' },
              ],
              attrs: { level: 2, uid: 'UidgrRPV045' },
            },
            {
              type: 'paragraph',
              attrs: { uid: 'UidgrRPV046' },
              content: [
                {
                  type: 'text',
                  text: 'Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo. ',
                },
              ],
            },
            {
              type: 'heading',
              content: [{ type: 'text', text: 'Thanks' }],
              attrs: { level: 4, uid: 'UidgrRPV047' },
            },
          ],
        },
        locked: true,
      },
    });
    const d2 = await createDocument({
      user: u1,
      tx,
      data: {
        id: 'r2grRPVYnx',
        orgId: o1.id,
        projectId: pAnalytics.id,
        type: 'rfc',
        typeId: 2,
        name: 'Frontend definition',
        tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
        content: { type: 'doc', content: [] },
        locked: false,
      },
    });
    const d3 = await createDocument({
      user: u1,
      tx,
      data: {
        id: 'r3grRPVYnx',
        orgId: o1.id,
        projectId: pAnalytics.id,
        type: 'rfc',
        typeId: 3,
        name: 'Use of Oauth2 in authentication system',
        tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
        content: { type: 'doc', content: [] },
        locked: false,
      },
    });
    const d4 = await createDocument({
      user: u1,
      tx,
      data: {
        id: 'r4grRPVYnx',
        orgId: o1.id,
        projectId: pAnalytics.id,
        type: 'rfc',
        typeId: 4,
        name: 'API Global Specification',
        tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
        content: docRfc4Json,
        locked: false,
      },
    });

    // Document has user
    await Promise.all([
      [d1, d2, d3, d4].map(async (d) => {
        return tx.typeHasUsers.create({
          data: { documentId: d.id, userId: u1.id, role: 'author' },
        });
      }),
      tx.typeHasUsers.create({
        data: { documentId: d2.id, userId: u2.id, role: 'author' },
      }),
    ]);
    await tx.typeHasUsers.create({
      data: { documentId: d1.id, userId: u2.id, role: 'reviewer' },
    });

    return { d1, d2, d3, d4 };
  });

  return res;
}

/**
 * Seed playbook
 */
export async function seedDocs(
  { o1 }: { o1: Orgs },
  { pAnalytics }: { pAnalytics: Projects },
  [u1]: Users[]
) {
  const res = await prisma.$transaction(async (tx) => {
    const d1 = await createDocument({
      user: u1,
      data: {
        id: 'z1grRPVYnx',
        orgId: o1.id,
        projectId: pAnalytics.id,
        source: 'github',
        sourcePath: '/docs/README.md',
        type: 'doc',
        typeId: null,
        tldr: '',
        name: 'README',
        content: {
          content: [
            {
              type: 'paragraph',
              attrs: { uid: 'UidgrRPV001' },
              content: [
                {
                  type: 'text',
                  text: 'Ut semper eros ipsum, eget rutrum nisi consequat vitae.',
                },
              ],
            },
          ],
          type: 'doc',
        },
        locked: false,
      },
      tx,
    });
    const d2 = await createDocument({
      user: u1,
      data: {
        id: 'z2grRPVYnx',
        orgId: o1.id,
        projectId: pAnalytics.id,
        source: 'github',
        sourcePath: '/docs/decisions/README.md',
        parentId: null,
        type: 'doc',
        typeId: null,
        tldr: '',
        name: 'Decisions',
        content: {
          content: [
            {
              type: 'paragraph',
              attrs: { uid: 'UidgrRPV001' },
              content: [
                {
                  type: 'text',
                  text: 'Consequat vitae.',
                },
              ],
            },
          ],
          type: 'doc',
        },
        locked: false,
      },
      tx,
    });
    const d3 = await createDocument({
      user: u1,
      data: {
        id: 'z3grRPVYnx',
        orgId: o1.id,
        projectId: pAnalytics.id,
        source: 'github',
        sourcePath: '/docs/deicisions/Nested.md',
        parentId: d2.id,
        type: 'doc',
        typeId: null,
        tldr: '',
        name: 'Using Specfy to host our Documentation',
        content: {
          content: [
            {
              type: 'paragraph',
              attrs: { uid: 'UidgrRPV001' },
              content: [
                {
                  type: 'text',
                  text: 'Consequat vitae.',
                },
              ],
            },
          ],
          type: 'doc',
        },
        locked: false,
      },
      tx,
    });

    return { d1, d2, d3 };
  });

  return res;
}

export async function seedDocument(
  user: Users,
  org: Orgs,
  project: Projects,
  docType?: ApiDocument['type']
) {
  const type: ApiDocument['type'] = docType || 'rfc';
  const id = nanoid();
  const document = await createDocument({
    user: user,
    tx: prisma,
    data: {
      id: id,
      orgId: org.id,
      projectId: project.id,
      type,
      typeId: await getDocumentTypeId({
        data: { orgId: org.id, projectId: project.id, type },
        tx: prisma,
      }),
      name: `Document ${id}`,
      tldr: '',
      content: { type: 'doc', content: [] },
      locked: false,
    },
  });

  return document;
}

export function getBlobDocument(org: Orgs, project: Projects): DBDocument {
  const id = nanoid();
  const name = `test ${id}`;
  return {
    id,
    name,
    slug: slugify(name),
    type: 'doc',
    typeId: null,
    orgId: org.id,
    projectId: project.id,
    blobId: null,
    parentId: null,
    locked: false,
    tldr: '',
    content: { type: 'doc', content: [] },
    source: null,
    sourcePath: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
