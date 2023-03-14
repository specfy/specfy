import type { User } from '../../models';
import { Perm, Project } from '../../models';
import type { ApiProject } from '../../types/api';

/**
 * Seed projects
 */
export async function seedProjects(users: User[]) {
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
    id: 'b01tMzwd5A',
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
    id: 'b02tMzwd5A',
    name: 'Frontend',
    display: {
      zIndex: 1,
      pos: { x: 220, y: -20, width: 100, height: 32 },
    },
  });

  const p1 = await Project.create({
    ...defProject,
    id: 'b03tMzwd5A',
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
    id: 'b04tMzwd5A',
    name: 'API',
    display: {
      zIndex: 1,
      pos: { x: -150, y: 40, width: 100, height: 32 },
    },
  });

  const p5 = await Project.create({
    ...defProject,
    id: 'b05tMzwd5A',
    name: 'Billing',
    display: {
      zIndex: 1,
      pos: { x: 20, y: 120, width: 100, height: 32 },
    },
  });

  // ---- Edges for graph
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

  // ---- Permissions
  await Promise.all([
    ...users.map((u) => {
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
      userId: users[0].id,
      role: 'owner',
    }),
    Perm.create({
      orgId: 'company',
      projectId: null,
      userId: users[0].id,
      role: 'owner',
    }),
    Perm.create({
      orgId: 'company',
      projectId: p1.id,
      userId: users[0].id,
      role: 'owner',
    }),
    Perm.create({
      orgId: 'company',
      projectId: p1.id,
      userId: users[1].id,
      role: 'reviewer',
    }),
    Perm.create({
      orgId: 'company',
      projectId: p1.id,
      userId: users[2].id,
      role: 'viewer',
    }),

    ...[users[3], users[4], users[5], users[6]].map((u) => {
      return Perm.create({
        orgId: 'company',
        projectId: p1.id,
        userId: u.id,
        role: 'contributor',
      });
    }),
  ]);

  return { p1, /*p2,*/ p3, p4, p5 };
}