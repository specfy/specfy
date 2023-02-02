import { Component, User, Document, Org, Project, Perm } from '../models';

import './';

export async function clean() {
  await Promise.all([
    User.truncate(),
    Org.truncate(),
    Project.truncate(),
    Document.truncate(),
    Component.truncate(),
    Perm.truncate(),
  ]);
}

export async function seed() {
  // Users
  const [u1, u2, u3, u4, u5, u6, u7] = await Promise.all([
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
  ]);

  // Org
  await Org.create({
    id: 'algolia',
    name: 'Algolia',
  });

  // Projects
  const p1 = await Project.create({
    orgId: 'algolia',
    name: 'Crawler',
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pharetra eros vel felis scelerisque pretium. Maecenas ac feugiat orci, a sodales lacus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent urna libero, convallis eu commodo id, iaculis aliquam arcu.<br>
    Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In interdum egestas massa, sit amet auctor ipsum maximus in. `,
  });
  await Project.create({
    orgId: 'algolia',
    name: 'Dashboard',
    description: `Donec mollis pretium nisl at dignissim. Duis dui magna, tempus a scelerisque id, semper eu metus.`,
  });
  const p3 = await Project.create({
    orgId: 'algolia',
    name: 'Analytics API',
    description: `Duis dui magna, tempus a scelerisque id, semper eu metus.`,
  });

  // Permissions
  await Promise.all([
    ...[u2, u3, u4, u5, u6, u7].map((u) => {
      return Perm.create({
        orgId: 'algolia',
        projectId: null,
        userId: u.id,
        role: 'viewer',
      });
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
  await Document.create({
    orgId: 'algolia',
    projectId: p1.id,
    type: 'rfc',
    name: 'API definition',
    // create: '3',
    // update: ['2'],
    // use: ['4', '6'],
    // remove: ['1'],
    tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
    blocks: [
      { type: 'heading', content: 'Overview', level: 1 },
      {
        type: 'content',
        content: [
          {
            type: 'text',
            content:
              'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque aliquam eget nibh eu sodales. Donec bibendum eros at tincidunt aliquam. Praesent non ipsum in enim elementum posuere. Aenean pellentesque et velit quis pretium. Duis et ligula imperdiet, fermentum nulla et, viverra magna. Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula. Nunc eget blandit metus. Etiam interdum laoreet libero eu pharetra. Phasellus lobortis mauris posuere velit finibus, a ultrices neque faucibus. Maecenas laoreet varius quam.',
          },
          {
            type: 'text',
            content: 'A link to a documentation',
            link: 'https://google.com',
          },
        ],
      },
      { type: 'heading', content: 'Goals and Non-Goals', level: 1 },
      {
        type: 'content',
        content: [
          {
            type: 'text',
            content:
              'Donec scelerisque ante vel felis gravida bibendum. Vestibulum quam purus, porta ac ornare sit amet, imperdiet at augue. Duis ac libero nec magna malesuada rhoncus at sit amet purus. Donec sed vulputate est. Donec accumsan ullamcorper auctor. Ut orci lectus, ornare id interdum sit amet, hendrerit et elit. Proin venenatis semper ipsum eget cursus. ',
          },
          {
            type: 'text',
            content:
              'Aliquam nunc ante, sodales eget egestas id, elementum et dui.',
            style: { code: true },
          },
        ],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'item',
            content: [
              {
                type: 'content',
                content: [
                  {
                    type: 'text',
                    content: 'lorem ipsum',
                  },
                ],
              },
            ],
          },
          {
            type: 'item',
            content: [
              {
                type: 'content',
                content: [
                  {
                    type: 'text',
                    content: 'dolor',
                    style: { bold: true },
                  },
                  {
                    type: 'text',
                    content: 'sit',
                    style: { bold: true, italic: true },
                  },
                  {
                    type: 'text',
                    content: 'amet',
                    style: { italic: true },
                  },
                ],
              },
            ],
          },
        ],
      },
      { type: 'heading', content: 'Background & Motivation', level: 1 },
      {
        type: 'content',
        content: [
          {
            type: 'text',
            content:
              'Pellentesque suscipit venenatis tellus vitae posuere. Donec at tellus ut ligula efficitur fermentum. Nam pharetra arcu et mattis porta. Aliquam vehicula quam non nisl tincidunt dignissim. Nunc egestas mi in ligula dignissim tristique. Vestibulum quis lacinia arcu. Fusce vehicula enim vitae erat feugiat, at laoreet tortor blandit.',
          },
        ],
      },
      { type: 'heading', content: 'Implementations', level: 1 },
      {
        type: 'content',
        content: [
          {
            type: 'text',
            content:
              'Phasellus orci ante, lobortis vel ullamcorper at, placerat eget leo. Pellentesque in nisi aliquam, rutrum nunc quis, bibendum velit. Etiam efficitur lacinia cursus. Duis neque nunc, consequat sit amet dignissim vel, semper a eros. Duis vel augue ut mauris molestie sodales nec id diam. Aenean blandit ornare nisl vitae venenatis. Ut accumsan ultricies lacinia. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Suspendisse potenti. Vestibulum ipsum dolor, rhoncus vel arcu non, sollicitudin eleifend quam. Fusce et nisi mi. Maecenas nisi quam, interdum at eros vitae, aliquam rutrum nunc. Praesent et pharetra dolor. Nam hendrerit nulla ex, vel lacinia ligula interdum a.',
          },
        ],
      },
      { type: 'heading', content: 'Solutions', level: 2 },
      { type: 'heading', content: '#1 Naive one', level: 3 },
      {
        type: 'content',
        content: [
          {
            type: 'text',
            content:
              'Praesent sodales lorem id diam pellentesque, quis tincidunt risus porttitor. Vivamus dapibus aliquet ipsum. Nullam non leo neque. Aliquam in enim id nulla elementum pretium. Nullam scelerisque quam ut mattis egestas. Ut semper eros ipsum, eget rutrum nisi consequat vitae. Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo. Nunc id tellus felis. Suspendisse dui massa, volutpat ac tincidunt eu, cursus eget metus. Proin vel viverra mi. Maecenas a finibus felis, et dapibus orci. Sed molestie sed ex vitae sodales. Vestibulum ut leo posuere nulla commodo iaculis.',
          },
        ],
      },
      { type: 'heading', content: 'FAQ', level: 1 },
      {
        type: 'heading',
        content: 'What is this awesome website?',
        level: 2,
      },
      {
        type: 'content',
        content: [
          {
            type: 'text',
            content:
              ' Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo. ',
          },
        ],
      },
      { type: 'heading', content: 'Thanks', level: 4 },
    ],
    locked: true,
    status: 'approved',
    // authors: ['1'],
    // reviewers: ['2'],
    // approvedBy: ['3'],
  });
  await Document.create({
    orgId: 'algolia',
    projectId: p1.id,
    type: 'rfc',
    name: 'Frontend definition',
    // create: '3',
    // update: ['2'],
    // use: ['4', '6'],
    // remove: ['1'],
    tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
    blocks: [],
    locked: false,
    status: 'draft',
  });
  await Document.create({
    orgId: 'algolia',
    projectId: p1.id,
    type: 'rfc',
    name: 'Use of Oauth2 in authentication system',
    // create: '3',
    // update: ['2'],
    // use: ['4', '6'],
    // remove: ['1'],
    tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
    blocks: [],
    locked: false,
    status: 'rejected',
  });

  // Components
  const gcp = await Component.create({
    name: 'GCP',
    type: 'hosting',
    orgId: 'algolia',
    projectId: p1.id,
    display: {
      zIndex: 1,
      pos: { x: 20, y: 20, width: 350, height: 350 },
    },
    inComponent: null,
    fromComponents: [],
    toComponents: [],
  });
  const compute = await Component.create({
    name: 'Compute Engine',
    type: 'hosting',
    orgId: 'algolia',
    projectId: p1.id,
    display: {
      zIndex: 2,
      pos: { x: 30, y: 320, width: 150, height: 40 },
    },
    inComponent: gcp.id,
    fromComponents: [],
    toComponents: [],
  });
  const kube = await Component.create({
    name: 'Kubernetes',
    type: 'hosting',
    orgId: 'algolia',
    projectId: p1.id,
    display: {
      zIndex: 2,
      pos: { x: 100, y: 50, width: 240, height: 250 },
    },
    inComponent: gcp.id,
    fromComponents: [],
    toComponents: [],
  });
  const pg = await Component.create({
    name: 'Postgresql',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    display: { zIndex: 3, pos: { x: 30, y: 190 width: 100, height: 24 } },
    inComponent: gcp.id,
    fromComponents: [],
    toComponents: [],
  });
  const dd = await Component.create({
    name: 'Datadog',
    type: 'thirdparty',
    orgId: 'algolia',
    projectId: p1.id,
    display: { zIndex: 3, pos: { x: 390, y: 200, width: 100, height: 24 } },
    inComponent: null,
    fromComponents: [],
    toComponents: [],
  });
  const sentry = await Component.create({
    name: 'Sentry',
    type: 'thirdparty',
    orgId: 'algolia',
    projectId: p1.id,
    display: { zIndex: 3, pos: { x: 390, y: 240, width: 100, height: 24 } },
    inComponent: null,
    fromComponents: [],
    toComponents: [],
  });
  const algolia = await Component.create({
    name: 'Algolia',
    type: 'thirdparty',
    orgId: 'algolia',
    projectId: p1.id,
    display: { zIndex: 3, pos: { x: 390, y: 280, width: 100, height: 24 } },

    inComponent: null,
    fromComponents: [],
    toComponents: [],
  });
  const redis = await Component.create({
    name: 'Redis',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    display: { zIndex: 3, pos: { x: 30, y: 120, width: 100, height: 24 } },
    inComponent: gcp.id,
    fromComponents: [],
    toComponents: [],
  });
  const es = await Component.create({
    name: 'Elatiscsearch',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    display: { zIndex: 3, pos: { x: 34, y: 324, width: 100, height: 24 } },
    inComponent: compute.id,
    fromComponents: [],
    toComponents: [],
  });
  const rabbit = await Component.create({
    name: 'RabbitMQ',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    display: { zIndex: 3, pos: { x: 200, y: 220, width: 100, height: 24 } },
    inComponent: kube.id,
    fromComponents: [],
    toComponents: [],
  });
  const analytics = await Component.create({
    name: 'Analytics API',
    type: 'project',
    typeId: p3.id,
    orgId: 'algolia',
    projectId: p1.id,
    display: { zIndex: 3, pos: { x: 390, y: 90, width: 100, height: 24 } },
    inComponent: null,
    fromComponents: [],
    toComponents: [],
  });
  const api = await Component.create({
    name: 'Private API',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    description:
      'Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo.',
    display: { zIndex: 3, pos: { x: 210, y: 120, width: 100, height: 24 } },
    inComponent: kube.id,
    fromComponents: [pg.id, analytics.id, redis.id, es.id],
    toComponents: [pg.id, dd.id, sentry.id, redis.id],
    tech: ['NodeJS', 'Typescript', 'Bash', 'AtlasDB'],
  });
  await Component.create({
    name: 'Frontend',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    display: { zIndex: 4, pos: { x: 210, y: 80, width: 100, height: 24 } },
    inComponent: kube.id,
    fromComponents: [api.id],
    toComponents: [api.id, sentry.id],
    tech: ['React', 'Typescript', 'Webpack'],
  });
  const manager = await Component.create({
    name: 'Manager',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    description:
      'Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo.',
    display: { zIndex: 3, pos: { x: 200, y: 180, width: 100, height: 24 } },
    inComponent: kube.id,
    fromComponents: [pg.id, es.id, rabbit.id],
    toComponents: [pg.id, dd.id, sentry.id, rabbit.id, algolia.id],
    tech: ['NodeJS', 'Typescript'],
  });
  const worker = await Component.create({
    name: 'Worker',
    type: 'component',
    orgId: 'algolia',
    projectId: p1.id,
    description: 'Maecenas pharetra imperdiet nulla nec commodo.',
    display: { zIndex: 3, pos: { x: 200, y: 260, width: 100, height: 24 } },
    inComponent: kube.id,
    fromComponents: [pg.id, es.id, rabbit.id, algolia.id],
    toComponents: [pg.id, dd.id, sentry.id, es.id, rabbit.id],
    tech: ['NodeJS', 'Typescript'],
  });
}

(async () => {
  console.log('Cleaning');
  await clean();
  console.log('Seeding');
  await seed();
  console.log('Seeding done');
})();
