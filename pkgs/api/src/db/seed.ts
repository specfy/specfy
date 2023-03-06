import {
  Component,
  User,
  Document,
  Org,
  Project,
  Perm,
  TypeHasUser,
  Revision,
  RevisionBlob,
} from '../models';
import type { ApiProject } from '../types/api';

import './';

export async function clean() {
  await Promise.all([
    User.truncate(),
    Org.truncate(),
    Project.truncate(),
    Document.truncate(),
    Component.truncate(),
    Perm.truncate(),
    Revision.truncate(),
    RevisionBlob.truncate(),
    TypeHasUser.truncate(),
  ]);
}

export async function seed() {
  // Users
  const [u1, u2, u3, u4, u5, u6, u7, u8] = await Promise.all([
    await User.create({
      name: 'Samuel Bodin',
      email: 'bodin.samuel@gmail.com',
    }),
    await User.create({
      name: 'Raphael Daguenet',
      email: 'raphdag@gmail.com',
    }),
    await User.create({
      name: 'Nicolas Torres',
      email: 'nicote@gmail.com',
    }),
    await User.create({
      name: 'John Doe',
      email: 'john.doe@gmail.com',
    }),
    await User.create({
      name: 'Alice Wong',
      email: 'alice.wong@gmail.com',
    }),
    await User.create({
      name: 'Walther Phillips',
      email: 'WalterLPhillips@gmail.com',
    }),
    await User.create({
      name: 'Clementine Dandonneau',
      email: 'ClementineDandonneau@gmail.com',
    }),
    await User.create({
      name: 'Lisha A. James',
      email: 'LishaAJames@gmail.com',
    }),
  ]);

  // Org
  await Org.create({
    id: 'algolia',
    name: 'Algolia',
  });
  await Org.create({
    id: 'samuelbodin',
    name: "Samuel Bodin's org",
  });

  // Projects
  const defProject = {
    orgId: 'algolia',
    links: [],
    edges: [],
    description: {
      type: 'doc',
      content: [],
    },
  } as unknown as ApiProject;
  const p0 = await Project.create({
    ...defProject,
    id: '10000000-0000-4000-0000-000000000000',
    name: 'Dashboard',
    description: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: `Donec mollis pretium nisl at dignissim. Duis dui magna, tempus a scelerisque id, semper eu metus.`,
            },
          ],
        },
      ],
    },
    display: {
      zIndex: 1,
      pos: { x: 20, y: 10, width: 100, height: 32 },
    },
  });
  const p3 = await Project.create({
    ...defProject,
    id: '20000000-0000-4000-0000-000000000000',
    name: 'Frontend',
    display: {
      zIndex: 1,
      pos: { x: 220, y: -20, width: 100, height: 32 },
    },
  });
  const p1 = await Project.create({
    ...defProject,
    id: '00000000-0000-4000-0000-000000000000',
    name: 'Analytics',
    description: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pharetra eros vel felis scelerisque pretium. Maecenas ac feugiat orci, a sodales lacus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent urna libero, convallis eu commodo id, iaculis aliquam arcu.`,
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
    links: [{ title: 'Github', link: 'https://github.com/bodinsamuel' }],
    display: {
      zIndex: 1,
      pos: { x: 200, y: 70, width: 100, height: 32 },
    },
  });
  const p4 = await Project.create({
    ...defProject,
    name: 'API',
    display: {
      zIndex: 1,
      pos: { x: -150, y: 40, width: 100, height: 32 },
    },
  });
  const p5 = await Project.create({
    ...defProject,
    name: 'Billing',
    display: {
      zIndex: 1,
      pos: { x: 20, y: 120, width: 100, height: 32 },
    },
  });

  await p0.update({
    edges: [
      {
        to: p4.id,
        read: true,
        write: false,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: p5.id,
        read: true,
        write: false,
        vertices: [
          { x: -5, y: 60 },
          { x: -5, y: 110 },
        ],
        portSource: 'left',
        portTarget: 'left',
      },
    ],
  });
  await p3.update({
    edges: [
      {
        to: p0.id,
        read: true,
        write: false,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
    ],
  });
  await p1.update({
    edges: [
      {
        to: p0.id,
        read: true,
        write: false,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: p4.id,
        read: true,
        write: false,
        vertices: [{ x: 20, y: 80 }],
        portSource: 'left',
        portTarget: 'right',
      },
    ],
  });
  await p5.update({
    edges: [
      {
        to: p1.id,
        read: true,
        write: false,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
    ],
  });

  // Permissions
  await Promise.all([
    ...[u2, u3, u4, u5, u6, u7, u8].map((u) => {
      return Perm.create({
        orgId: 'algolia',
        projectId: null,
        userId: u.id,
        role: 'viewer',
      });
    }),
    Perm.create({
      orgId: 'samuelbodin',
      projectId: null,
      userId: u1.id,
      role: 'owner',
    }),
    Perm.create({
      orgId: 'algolia',
      projectId: null,
      userId: u1.id,
      role: 'owner',
    }),
    Perm.create({
      orgId: 'algolia',
      projectId: p1.id,
      userId: u1.id,
      role: 'owner',
    }),
    Perm.create({
      orgId: 'algolia',
      projectId: p1.id,
      userId: u2.id,
      role: 'reviewer',
    }),
    Perm.create({
      orgId: 'algolia',
      projectId: p1.id,
      userId: u3.id,
      role: 'viewer',
    }),

    ...[u4, u5, u6, u7].map((u) => {
      return Perm.create({
        orgId: 'algolia',
        projectId: p1.id,
        userId: u.id,
        role: 'contributor',
      });
    }),
  ]);

  // Contents
  const d1 = await Document.create({
    id: '01000000-0000-4000-0000-000000000000',
    orgId: 'algolia',
    projectId: p1.id,
    type: 'rfc',
    name: 'API definition',
    // create: '3',
    // update: ['2'],
    // use: ['4', '6'],
    // remove: ['1'],
    tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          content: [{ type: 'text', text: 'Overview' }],
          attrs: { level: 1 },
        },
        {
          type: 'paragraph',
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
                    href: 'http://localhost:5173/algolia/crawler',
                    target: '_blank',
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
          attrs: { level: 1 },
        },
        {
          type: 'paragraph',
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
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
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
              content: [
                {
                  type: 'paragraph',
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
          attrs: { level: 1 },
        },
        // {
        //   type: 'media',
        //   attrs: {
        //     layout: 'center',
        //   },
        //   content: [
        //     {
        //       type: 'media',
        //       attrs: {
        //         width: 810,
        //         id: '8873d820-e7d0-4e1e-8092-7e32464ea656',
        //         collection: 'contentId-131176',
        //         type: 'file',
        //         height: 610,
        //       },
        //     },
        //   ],
        // },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Pellentesque suscipit venenatis tellus vitae posuere. Donec at tellus ut ligula efficitur fermentum. Nam pharetra arcu et mattis porta. Aliquam vehicula quam non nisl tincidunt dignissim. Nunc egestas mi in ligula dignissim tristique. Vestibulum quis lacinia arcu. Fusce vehicula enim vitae erat feugiat, at laoreet tortor blandit.',
            },
          ],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'A checked task.' }],
                },
              ],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Not done.' }],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          content: [{ type: 'text', text: 'Implementations' }],
          attrs: { level: 1 },
        },
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
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
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Phasellus orci ante, lobortis vel ullamcorper at, placerat eget leo. Pellentesque in nisi aliquam, rutrum nunc quis, bibendum velit. Etiam efficitur lacinia cursus. ',
            },
            { type: 'text', text: 'This is code.', marks: [{ type: 'code' }] },
            {
              type: 'text',
              text: 'Duis neque nunc, consequat sit amet dignissim vel, semper a eros. Duis vel augue ut mauris molestie sodales nec id diam. Aenean blandit ornare nisl vitae venenatis. Ut accumsan ultricies lacinia. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Suspendisse potenti. Vestibulum ipsum dolor, rhoncus vel arcu non, sollicitudin eleifend quam. Fusce et nisi mi. Maecenas nisi quam, interdum at eros vitae, aliquam rutrum nunc. Praesent et pharetra dolor. Nam hendrerit nulla ex, vel lacinia ligula interdum a.',
            },
          ],
        },
        {
          type: 'heading',
          content: [{ type: 'text', text: 'Solutions' }],
          attrs: { level: 2 },
        },
        {
          type: 'heading',
          content: [{ type: 'text', text: '#1 Naive one' }],
          attrs: { level: 3 },
        },
        // {
        //   type: 'panel',
        //   panelType: 'error',
        //   content: [
        //     {
        //       type: 'paragraph',
        //       content: [
        //         {
        //           content:
        //             'Ut semper eros ipsum, eget rutrum nisi consequat vitae.',
        //           type: 'text',
        //         },
        //       ],
        //     },
        //   ],
        // },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Praesent sodales lorem id diam pellentesque, quis tincidunt risus porttitor. Vivamus dapibus aliquet ipsum. Nullam non leo neque. Aliquam in enim id nulla elementum pretium. Nullam scelerisque quam ut mattis egestas. Ut semper eros ipsum, eget rutrum nisi consequat vitae. Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo. Nunc id tellus felis. Suspendisse dui massa, volutpat ac tincidunt eu, cursus eget metus. Proin vel viverra mi. Maecenas a finibus felis, et dapibus orci. Sed molestie sed ex vitae sodales. Vestibulum ut leo posuere nulla commodo iaculis.',
            },
          ],
        },
        // {
        //   type: 'code',
        //   attrs: {
        //     language: 'html',
        //   },
        //   content: [
        //     {
        //       text: '\u003Cdiv\u003Eprout\u003C\u002Fdiv\u003E\\n\u003Ccenter\u003E\u002F',
        //       type: 'text',
        //     },
        //   ],
        // },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableHeader',
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: [150],
                  },
                  content: [
                    {
                      type: 'paragraph',
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
                  },
                  content: [
                    {
                      type: 'paragraph',
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
              content: [
                {
                  type: 'tableCell',
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
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
                  },
                  content: [
                    {
                      type: 'paragraph',
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
        },
        {
          type: 'heading',
          content: [{ type: 'text', text: 'FAQ' }],
          attrs: { level: 1 },
        },
        {
          type: 'heading',
          content: [{ type: 'text', text: 'What is this awesome website?' }],
          attrs: { level: 2 },
        },
        {
          type: 'paragraph',
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
          attrs: { level: 4 },
        },
      ],
    },
    locked: true,
    // authors: ['1'],
    // reviewers: ['2'],
    // approvedBy: ['3'],
  });
  const d2 = await Document.create({
    id: '01100000-0000-4000-0000-000000000000',
    orgId: 'algolia',
    projectId: p1.id,
    type: 'rfc',
    name: 'Frontend definition',
    // create: '3',
    // update: ['2'],
    // use: ['4', '6'],
    // remove: ['1'],
    tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
    content: { type: 'doc', content: [] },
    locked: false,
  });
  const d3 = await Document.create({
    id: '01200000-0000-4000-0000-000000000000',
    orgId: 'algolia',
    projectId: p1.id,
    type: 'rfc',
    name: 'Use of Oauth2 in authentication system',
    // create: '3',
    // update: ['2'],
    // use: ['4', '6'],
    // remove: ['1'],
    tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
    content: { type: 'doc', content: [] },
    locked: false,
  });

  // Document has user
  await Promise.all([
    [d1.id, d2.id, d3.id].map((id) =>
      TypeHasUser.create({
        documentId: id,
        userId: u1.id,
        role: 'author',
      })
    ),
    TypeHasUser.create({
      documentId: d2.id,
      userId: u2.id,
      role: 'author',
    }),
  ]);
  await TypeHasUser.create({
    documentId: d1.id,
    userId: u2.id,
    role: 'reviewer',
  });

  // Components
  const gcp = await Component.create({
    name: 'GCP',
    type: 'hosting',
    orgId: 'algolia',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: {
      zIndex: 1,
      pos: { x: 20, y: 20, width: 410, height: 370 },
    },
    inComponent: null,
    edges: [],
  });
  const compute = await Component.create({
    name: 'Compute Engine',
    type: 'hosting',
    orgId: 'algolia',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: {
      zIndex: 2,
      pos: { x: 30, y: 340, width: 150, height: 45 },
    },
    inComponent: gcp.id,
    edges: [],
  });
  const kube = await Component.create({
    name: 'Kubernetes',
    type: 'hosting',
    orgId: 'algolia',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: {
      zIndex: 2,
      pos: { x: 150, y: 50, width: 240, height: 300 },
    },
    inComponent: gcp.id,
    edges: [],
  });
  const pg = await Component.create({
    name: 'Postgresql',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 30, y: 190, width: 100, height: 32 } },
    inComponent: gcp.id,
    edges: [],
  });
  const dd = await Component.create({
    name: 'Datadog',
    type: 'thirdparty',
    orgId: 'algolia',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 440, y: 190, width: 100, height: 32 } },
    inComponent: null,
    edges: [],
  });
  const sentry = await Component.create({
    name: 'Sentry',
    type: 'thirdparty',
    orgId: 'algolia',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 440, y: 240, width: 100, height: 32 } },
    inComponent: null,
    edges: [],
  });
  const algolia = await Component.create({
    name: 'Algolia',
    type: 'thirdparty',
    orgId: 'algolia',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 440, y: 290, width: 100, height: 32 } },
    inComponent: null,
    edges: [],
  });
  const redis = await Component.create({
    name: 'Redis',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 30, y: 120, width: 100, height: 32 } },
    inComponent: gcp.id,
    edges: [],
  });
  const es = await Component.create({
    name: 'Elasticsearch',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 34, y: 340, width: 100, height: 32 } },
    inComponent: compute.id,
    edges: [],
  });
  const rabbit = await Component.create({
    name: 'RabbitMQ',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 210, y: 240, width: 100, height: 32 } },
    inComponent: kube.id,
    edges: [],
  });
  const analytics = await Component.create({
    name: 'Analytics API',
    type: 'project',
    typeId: p3.id,
    orgId: 'algolia',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 440, y: 90, width: 100, height: 32 } },
    inComponent: null,
    edges: [],
  });
  const api = await Component.create({
    name: 'Private API',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    description: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo.',
            },
          ],
        },
      ],
    },
    display: { zIndex: 3, pos: { x: 210, y: 120, width: 100, height: 32 } },
    inComponent: kube.id,
    edges: [
      {
        to: redis.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: pg.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: analytics.id,
        read: true,
        write: false,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
      {
        to: es.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: dd.id,
        read: false,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
      {
        to: sentry.id,
        read: false,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
      {
        to: algolia.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
    ],
    tech: ['NodeJS', 'Typescript', 'Bash', 'AtlasDB'],
  });
  await Component.create({
    name: 'Frontend',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 4, pos: { x: 210, y: 60, width: 100, height: 32 } },
    inComponent: kube.id,
    edges: [
      {
        to: api.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'bottom',
        portTarget: 'top',
      },
      {
        to: algolia.id,
        read: true,
        write: false,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
      {
        to: sentry.id,
        read: false,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
    ],
    tech: ['React', 'Typescript', 'Webpack'],
  });
  await Component.create({
    name: 'Manager',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    description: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo.',
            },
          ],
        },
      ],
    },
    display: { zIndex: 3, pos: { x: 210, y: 180, width: 100, height: 32 } },
    inComponent: kube.id,
    edges: [
      {
        to: pg.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: rabbit.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'bottom',
        portTarget: 'top',
      },
      {
        to: es.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: algolia.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
      {
        to: dd.id,
        read: false,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
      {
        to: sentry.id,
        read: false,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
    ],
    tech: ['NodeJS', 'Typescript'],
  });
  await Component.create({
    name: 'Worker',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    description: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Maecenas pharetra imperdiet nulla nec commodo.',
            },
          ],
        },
      ],
    },
    display: { zIndex: 3, pos: { x: 210, y: 300, width: 100, height: 32 } },
    inComponent: kube.id,
    edges: [
      {
        to: pg.id,
        read: true,
        write: false,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: rabbit.id,
        read: true,
        write: true,
        vertices: [],
        portSource: 'top',
        portTarget: 'bottom',
      },
      {
        to: es.id,
        read: true,
        write: false,
        vertices: [],
        portSource: 'left',
        portTarget: 'right',
      },
      {
        to: dd.id,
        read: false,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
      {
        to: sentry.id,
        read: false,
        write: true,
        vertices: [],
        portSource: 'right',
        portTarget: 'left',
      },
    ],
    tech: ['NodeJS', 'Typescript'],
  });

  // Revisions
  const projectRev = new Project({
    ...p1,
    name: 'Open Crawler',
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
  const b = await RevisionBlob.create({
    id: '00000000-0000-4000-0000-000000000000',
    orgId: 'algolia',
    projectId: p1.id,
    deleted: false,
    type: 'project',
    typeId: p1.id,
    parentId: p1.blobId,
    blob: projectRev.getJsonForBlob(),
  });
  const rev = await Revision.create({
    id: '00000000-0000-4000-0000-000000000000',
    orgId: 'algolia',
    projectId: p1.id,
    title: 'Update project name, description',
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
    blobs: [b.id],
  });
  await TypeHasUser.create({
    revisionId: rev.id,
    userId: u1.id,
    role: 'author',
  });
  await TypeHasUser.create({
    revisionId: rev.id,
    userId: u2.id,
    role: 'reviewer',
  });
  await TypeHasUser.create({
    revisionId: rev.id,
    userId: u3.id,
    role: 'reviewer',
  });
}

(async () => {
  console.log('Cleaning');
  await clean();
  console.log('Seeding');
  await seed();
  console.log('Seeding done');
})();
