import { nanoid } from '@specfy/core';
import type { Orgs, Projects, Users } from '@specfy/db';
import { prisma } from '@specfy/db';
import { recomputeOrgGraph, createProject } from '@specfy/models';
import { getBlobProject } from '@specfy/models/src/projects/test.utils';

interface ResSeedProjects {
  pDash: Projects;
  pAnalytics: Projects;
  pFront: Projects;
  pAPI: Projects;
  pBilling: Projects;
}
/**
 * Seed projects
 */
export async function seedProjects(
  { o1 }: { o1: Orgs },
  users: Users[]
): Promise<ResSeedProjects> {
  const res: ResSeedProjects = await prisma.$transaction(
    async (tx) => {
      const pDash = await createProject({
        data: {
          ...getBlobProject(o1),
          id: 'b01tMzwd5A',
          name: 'Dashboard',
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
        },
        user: users[0],
        tx,
      });

      const pFront = await createProject({
        data: { ...getBlobProject(o1), id: 'b02tMzwd5A', name: 'Frontend' },
        user: users[0],
        tx,
      });

      const pAnalytics = await createProject({
        data: {
          ...getBlobProject(o1),
          id: 'b03tMzwd5A',
          name: 'Analytics',
          description: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                attrs: { uid: 'UidC3Ls190' },
                content: [
                  {
                    type: 'text',
                    text: 'The Analytics project collects data from various sources, processes it, and presents it in dashboards and reports. These outputs show key indicators and trends for the business.',
                  },
                  { type: 'hardBreak' },
                  {
                    type: 'text',
                    text: `The project also employs machine learning and statistical methods to analyze data. This analysis helps in predicting trends and making recommendations based on past data. This project assists businesses in making data-based decisions.`,
                  },
                ],
              },
            ],
          },
          links: [
            { title: 'GitHub', url: 'https://github.com/specfy' },
            { title: 'Discord', url: 'https://discord.gg/96cDXvT8NV' },
          ],
        },
        user: users[0],
        tx,
      });

      const pAPI = await createProject({
        data: { ...getBlobProject(o1), id: 'b04tMzwd5A', name: 'API' },
        user: users[0],
        tx,
      });

      const pBilling = await createProject({
        data: { ...getBlobProject(o1), id: 'b05tMzwd5A', name: 'Billing' },
        user: users[0],
        tx,
      });

      // ---- Permissions
      await Promise.all([
        // Add one viewer
        tx.perms.create({
          data: {
            id: nanoid(),
            orgId: o1.id,
            projectId: pAnalytics.id,
            userId: users[1].id,
            role: 'viewer',
          },
        }),

        ...[users[3], users[4], users[5], users[6]].map((u) => {
          return tx.perms.create({
            data: {
              id: nanoid(),
              orgId: o1.id,
              projectId: pAnalytics.id,
              userId: u.id,
              role: 'contributor',
            },
          });
        }),
      ]);

      await recomputeOrgGraph({
        orgId: o1.id,
        updates: {
          edges: {},
          nodes: {
            b01tMzwd5A: {
              display: {
                pos: { x: 20, y: 10 },
                size: { width: 130, height: 40 },
              },
            },
            b02tMzwd5A: {
              display: {
                pos: { x: 220, y: -20 },
                size: { width: 130, height: 40 },
              },
            },
            b03tMzwd5A: {
              display: {
                pos: { x: 200, y: 70 },
                size: { width: 130, height: 40 },
              },
            },
            b04tMzwd5A: {
              display: {
                pos: { x: -150, y: 40 },
                size: { width: 130, height: 40 },
              },
            },
            b05tMzwd5A: {
              display: {
                pos: { x: 0, y: 120 },
                size: { width: 130, height: 40 },
              },
            },
          },
        },
        tx,
      });

      return { pDash, pAnalytics, /*p2,*/ pFront, pAPI, pBilling };
    },
    { timeout: 20000 }
  );

  return res;
}

export async function seedProject(user: Users, org: Orgs) {
  const id = nanoid();
  const project = await createProject({
    data: { ...getBlobProject(org), id, name: `Project ${id}` },
    tx: prisma,
    user,
  });

  return project;
}
