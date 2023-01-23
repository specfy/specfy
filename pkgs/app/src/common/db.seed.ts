import { db } from './db';

export async function seed() {
  db.transaction(
    'rw',
    db.users,
    db.orgs,
    db.projects,
    db.contents,
    async () => {
      await db.users.clear();
      await db.orgs.clear();
      await db.projects.clear();
      await db.contents.clear();

      // Users
      await db.users.add({
        id: '1',
        name: 'Samuel Bodin',
        email: 'bodin.samuel@gmail.com',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });
      await db.users.add({
        id: '2',
        name: 'Raphael Daguenet',
        email: 'raphdag@gmail.com',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });
      await db.users.add({
        id: '3',
        name: 'Nicolas Torres',
        email: 'nicote@gmail.com',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });
      await db.users.add({
        id: '4',
        name: 'John Doe',
        email: 'nicote@gmail.com',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });

      // Orgs
      await db.orgs.add({
        id: 'algolia',
        name: 'Algolia',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });

      // Projects
      await db.projects.add({
        id: '3hjfe8SUHer',
        orgId: 'algolia',
        slug: 'crawler',
        name: 'Crawler',
        description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pharetra eros vel felis scelerisque pretium. Maecenas ac feugiat orci, a sodales lacus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Praesent urna libero, convallis eu commodo id, iaculis aliquam arcu.<br>
      Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; In interdum egestas massa, sit amet auctor ipsum maximus in. Phasellus diam nulla, condimentum et ultrices sit amet, venenatis eget arcu. In hac habitasse platea dictumst. Donec a viverra mi.`,
        author: '1',
        links: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });
      await db.projects.add({
        id: '45jfe8SUFkjd',
        orgId: 'algolia',
        slug: 'dashboard',
        name: 'Dashboard',
        description:
          'Donec mollis pretium nisl at dignissim. Duis dui magna, tempus a scelerisque id, semper eu metus.',
        author: '1',
        links: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });
      await db.projects.add({
        id: '65jfe8SUFkj8',
        orgId: 'algolia',
        slug: 'analytics-api',
        name: 'Analytics API',
        description:
          'Duis dui magna, tempus a scelerisque id, semper eu metus.',
        author: '1',
        links: [],
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });

      // Contents
      await db.contents.add({
        id: '5',
        orgId: 'algolia',
        projectId: '3hjfe8SUHer',
        type: 'rfc',
        typeId: '1',
        name: 'API definition',
        slug: 'api-definition',
        create: '3',
        update: ['2'],
        use: ['4', '6'],
        remove: ['1'],
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
        authors: ['1'],
        reviewers: ['2'],
        approvedBy: ['3'],
        status: 'approved',
        locked: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });
      await db.contents.add({
        id: '6',
        orgId: 'algolia',
        projectId: '3hjfe8SUHer',
        type: 'rfc',
        typeId: '2',
        name: 'Frontend definition',
        slug: 'frontend-definition',
        create: '3',
        update: ['2'],
        use: ['4', '6'],
        remove: ['1'],
        tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
        blocks: [],
        approvedBy: [],
        authors: ['1'],
        reviewers: ['2'],
        status: 'draft',
        locked: false,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });
      await db.contents.add({
        id: '7',
        orgId: 'algolia',
        projectId: '3hjfe8SUHer',
        type: 'rfc',
        typeId: '3',
        name: 'Use of Oauth2 in authentication system',
        slug: 'use-of-oauth2-in-authentication-system',
        create: '3',
        update: ['2'],
        use: ['4', '6'],
        remove: ['1'],
        tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
        blocks: [],
        approvedBy: [],
        authors: ['1'],
        reviewers: ['2'],
        status: 'rejected',
        locked: true,
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
      });
    }
  );
}
