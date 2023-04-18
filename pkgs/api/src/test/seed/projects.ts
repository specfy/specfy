import type { Orgs, Users } from '@prisma/client';

import { nanoid } from '../../common/id';
import { slugify } from '../../common/string';
import { prisma } from '../../db';
import { createProject, updateProject } from '../../models/project';
import type { DBProject } from '../../types/db';

/**
 * Seed projects
 */
export async function seedProjects(users: Users[]) {
  const res = await prisma.$transaction(async (tx) => {
    let p0 = await createProject({
      data: {
        id: 'b01tMzwd5A',
        name: 'Dashboard',
        orgId: 'company',
        links: [],
        edges: [],
        description: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: { uid: nanoid() },
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
      },
      user: users[0],
      tx,
    });

    let p3 = await createProject({
      data: {
        id: 'b02tMzwd5A',
        name: 'Frontend',
        orgId: 'company',
        links: [],
        edges: [],
        description: { type: 'doc', content: [] },
        display: {
          zIndex: 1,
          pos: { x: 220, y: -20, width: 100, height: 32 },
        },
      },
      user: users[0],
      tx,
    });

    let p1 = await createProject({
      data: {
        id: 'b03tMzwd5A',
        name: 'Analytics',
        orgId: 'company',
        edges: [],
        description: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: { uid: 'UidC3Ls190' },
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
          { title: 'Github', url: 'https://github.com/bodinsamuel' },
          { title: 'Slack', url: 'https://slack.com/foobar' },
        ],
        display: {
          zIndex: 1,
          pos: { x: 200, y: 70, width: 100, height: 32 },
        },
      },
      user: users[0],
      tx,
    });

    const p4 = await createProject({
      data: {
        id: 'b04tMzwd5A',
        name: 'API',
        orgId: 'company',
        links: [],
        edges: [],
        description: { type: 'doc', content: [] },
        display: {
          zIndex: 1,
          pos: { x: -150, y: 40, width: 100, height: 32 },
        },
      },
      user: users[0],
      tx,
    });

    let p5 = await createProject({
      data: {
        id: 'b05tMzwd5A',
        name: 'Billing',
        orgId: 'company',
        links: [],
        edges: [],
        description: { type: 'doc', content: [] },
        display: {
          zIndex: 1,
          pos: { x: 20, y: 120, width: 100, height: 32 },
        },
      },
      user: users[0],
      tx,
    });

    // ---- Edges for graph
    p0 = await updateProject({
      original: p0,
      user: users[0],
      data: {
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
      },
      tx,
    });

    p3 = await updateProject({
      original: p3,
      user: users[0],
      data: {
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
      },
      tx,
    });

    p1 = await updateProject({
      original: p1,
      user: users[0],
      data: {
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
      },
      tx,
    });

    p5 = await updateProject({
      original: p5,
      user: users[0],
      data: {
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
      },
      tx,
    });

    // ---- Permissions
    await Promise.all([
      ...[p0, p1, p3, p4, p5].map((p) => {
        return tx.perms.create({
          data: {
            id: nanoid(),
            orgId: 'company',
            projectId: p.id,
            userId: users[0].id,
            role: 'owner',
          },
        });
      }),

      // Add one viewer
      tx.perms.create({
        data: {
          id: nanoid(),
          orgId: 'company',
          projectId: p1.id,
          userId: users[1].id,
          role: 'viewer',
        },
      }),

      ...[users[3], users[4], users[5], users[6]].map((u) => {
        return tx.perms.create({
          data: {
            id: nanoid(),
            orgId: 'company',
            projectId: p1.id,
            userId: u.id,
            role: 'contributor',
          },
        });
      }),
    ]);

    return { p0, p1, /*p2,*/ p3, p4, p5 };
  }, { timeout: 20000 });

  return res;
}

export async function seedProject(user: Users, org: Orgs) {
  const id = nanoid();
  const project = await createProject({
    data: {
      id,
      name: `Project ${id}`,
      orgId: org.id,
      links: [],
      edges: [],
      description: { type: 'doc', content: [] },
      display: {
        zIndex: 1,
        pos: { x: 20, y: 10, width: 100, height: 32 },
      },
    },
    tx: prisma,
    user,
  });
  await prisma.perms.create({
    data: {
      id: nanoid(),
      orgId: org.id,
      projectId: project.id,
      userId: user.id,
      role: 'owner',
    },
  });

  return project;
}

export function getBlobProject(org: Orgs): DBProject {
  const id = nanoid();
  const name = `test ${id}`;
  return {
    id,
    name,
    slug: slugify(name),
    blobId: null,
    orgId: org.id,
    links: [],
    edges: [],
    description: { type: 'doc', content: [] },
    display: {
      zIndex: 1,
      pos: { x: 220, y: -20, width: 100, height: 32 },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
