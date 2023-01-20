import { db } from './db';

export async function seed() {
  db.transaction('rw', db.users, db.orgs, db.projects, async () => {
    await db.users.clear();
    await db.orgs.clear();
    await db.projects.clear();

    await db.users.add({
      id: '1234',
      name: 'Samuel Bodin',
      email: 'bodin.samuel@gmail.com',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    });
    await db.orgs.add({
      id: 'algolia',
      name: 'Algolia',
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    });
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
      description: 'Duis dui magna, tempus a scelerisque id, semper eu metus.',
      author: '1',
      links: [],
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
    });
  });
}
