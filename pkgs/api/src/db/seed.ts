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
import { seedPlaybook, seedRFC } from './seed/content';

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
    id: 'company',
    name: 'My Company',
  });
  await Org.create({
    id: 'samuelbodin',
    name: "Samuel Bodin's org",
  });

  // Projects
  const defProject = {
    orgId: 'company',
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
    links: [
      { title: 'Github', link: 'https://github.com/bodinsamuel' },
      { title: 'Slack', link: 'https://slack.com/foobar' },
    ],
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
        orgId: 'company',
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
      orgId: 'company',
      projectId: null,
      userId: u1.id,
      role: 'owner',
    }),
    Perm.create({
      orgId: 'company',
      projectId: p1.id,
      userId: u1.id,
      role: 'owner',
    }),
    Perm.create({
      orgId: 'company',
      projectId: p1.id,
      userId: u2.id,
      role: 'reviewer',
    }),
    Perm.create({
      orgId: 'company',
      projectId: p1.id,
      userId: u3.id,
      role: 'viewer',
    }),

    ...[u4, u5, u6, u7].map((u) => {
      return Perm.create({
        orgId: 'company',
        projectId: p1.id,
        userId: u.id,
        role: 'contributor',
      });
    }),
  ]);

  await seedRFC(p1, [u1, u2]);
  await seedPlaybook(p1, [u1]);

  // Components
  const gcp = await Component.create({
    name: 'GCP',
    type: 'hosting',
    orgId: 'company',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: {
      zIndex: 1,
      pos: { x: -80, y: 20, width: 490, height: 370 },
    },
    inComponent: null,
    edges: [],
  });
  const compute = await Component.create({
    name: 'Compute Engine',
    type: 'hosting',
    orgId: 'company',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: {
      zIndex: 2,
      pos: { x: -60, y: 320, width: 150, height: 55 },
    },
    inComponent: gcp.id,
    edges: [],
  });
  const kube = await Component.create({
    name: 'Kubernetes',
    type: 'hosting',
    orgId: 'company',
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
    orgId: 'company',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: -10, y: 190, width: 100, height: 32 } },
    inComponent: gcp.id,
    edges: [],
  });
  const dd = await Component.create({
    name: 'Datadog',
    type: 'thirdparty',
    orgId: 'company',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 450, y: 190, width: 100, height: 32 } },
    inComponent: null,
    edges: [],
  });
  const sentry = await Component.create({
    name: 'Sentry',
    type: 'thirdparty',
    orgId: 'company',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 450, y: 250, width: 100, height: 32 } },
    inComponent: null,
    edges: [],
  });
  const algolia = await Component.create({
    name: 'Algolia',
    type: 'thirdparty',
    orgId: 'company',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 450, y: 310, width: 100, height: 32 } },
    inComponent: null,
    edges: [],
  });
  const redis = await Component.create({
    name: 'Redis',
    type: 'component',
    orgId: 'company',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: -10, y: 120, width: 100, height: 32 } },
    inComponent: gcp.id,
    edges: [],
  });
  const es = await Component.create({
    name: 'Elasticsearch',
    type: 'component',
    orgId: 'company',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: -40, y: 330, width: 100, height: 32 } },
    inComponent: compute.id,
    edges: [],
  });
  const rabbit = await Component.create({
    name: 'RabbitMQ',
    type: 'component',
    orgId: 'company',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 210, y: 240, width: 100, height: 32 } },
    inComponent: kube.id,
    edges: [],
  });
  const analytics = await Component.create({
    name: 'Dashboard',
    type: 'project',
    typeId: p3.id,
    orgId: 'company',
    projectId: p1.id,
    description: { type: 'doc', content: [] },
    display: { zIndex: 3, pos: { x: 450, y: 90, width: 100, height: 32 } },
    inComponent: null,
    edges: [],
  });
  const api = await Component.create({
    name: 'API',
    type: 'component',
    orgId: 'company',
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
        vertices: [
          { x: 160, y: 180 },
          { x: 110, y: 300 },
        ],
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
        vertices: [{ x: 400, y: 280 }],
        portSource: 'right',
        portTarget: 'left',
      },
    ],
    tech: ['NodeJS', 'Typescript', 'Bash', 'AtlasDB'],
  });
  await Component.create({
    name: 'Frontend',
    type: 'component',
    orgId: 'company',
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
        vertices: [{ x: 390, y: 270 }],
        portSource: 'right',
        portTarget: 'left',
      },
      {
        to: sentry.id,
        read: false,
        write: true,
        vertices: [{ x: 400, y: 230 }],
        portSource: 'right',
        portTarget: 'left',
      },
    ],
    tech: ['React', 'Typescript', 'Webpack'],
  });
  await Component.create({
    name: 'Manager',
    type: 'component',
    orgId: 'company',
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
    orgId: 'company',
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
    orgId: 'company',
    projectId: p1.id,
    deleted: false,
    type: 'project',
    typeId: p1.id,
    parentId: p1.blobId,
    blob: projectRev.getJsonForBlob(),
  });
  const rev = await Revision.create({
    id: '00000000-0000-4000-0000-000000000000',
    orgId: 'company',
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
