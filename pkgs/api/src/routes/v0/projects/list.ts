import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = async (fastify, _, done) => {
  fastify.get('/', async function () {
    return {
      data: [
        {
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
        },
        {
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
        },
        {
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
        },
      ],
      pagination: {
        total: 3,
        current: 3,
        page: 1,
      },
    };
  });

  done();
};

export default fn;
