import type { Orgs, Users } from '@prisma/client';

import { nanoid } from '../../common/id.js';
import { prisma } from '../../db/index.js';
import { createPoliciesActivity } from '../../models/index.js';

/**
 * Seed playbook
 */
export async function seedPolicies({ o1 }: { o1: Orgs }, [u1]: Users[]) {
  await prisma.$transaction(async (tx) => {
    const p1 = await tx.policies.create({
      data: {
        id: nanoid(),
        orgId: o1.id,
        type: 'template_revision',
        name: 'Simple Revision',
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: {
                level: 2,
                uid: 'UidgrPPP001',
              },
              content: [
                {
                  type: 'text',
                  text: 'Describe your changes',
                },
              ],
            },
          ],
        },
      },
    });

    const p2 = await tx.policies.create({
      data: {
        id: nanoid(),
        orgId: o1.id,
        type: 'template_rfc',
        name: 'Classic RFC',
        content: {
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: {
                level: 2,
                uid: 'UidgrPPP002',
              },
              content: [
                {
                  type: 'text',
                  text: 'Background and Motivations',
                },
              ],
            },
            {
              type: 'heading',
              attrs: {
                level: 2,
                uid: 'UidgrPPP003',
              },
              content: [
                {
                  type: 'text',
                  text: 'Goals and Non-Goals',
                },
              ],
            },
            {
              type: 'heading',
              attrs: {
                level: 2,
                uid: 'UidgrPPP004',
              },
              content: [
                {
                  type: 'text',
                  text: 'Implementation',
                },
              ],
            },
            {
              type: 'heading',
              attrs: {
                level: 2,
                uid: 'UidgrPPP005',
              },
              content: [
                {
                  type: 'text',
                  text: 'Drawbacks',
                },
              ],
            },
            {
              type: 'heading',
              attrs: {
                level: 2,
                uid: 'UidgrPPP006',
              },
              content: [
                {
                  type: 'text',
                  text: 'Alternatives',
                },
              ],
            },
            {
              type: 'heading',
              attrs: {
                level: 2,
                uid: 'UidgrPPP007',
              },
              content: [
                {
                  type: 'text',
                  text: 'FAQ',
                },
              ],
            },
          ],
        },
      },
    });
    // const p3 = await Policy.create({
    //   orgId:o1.id,
    //   type: 'template_rfc',
    //   name: 'Vote RFC',
    //   content: {
    //     type: 'doc',
    //     content: [],
    //   },
    // });

    const p4 = await tx.policies.create({
      data: {
        id: nanoid(),
        orgId: o1.id,
        type: 'promote',
        tech: 'nodejs',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: { uid: 'UidgrPPP008' },
              content: [
                {
                  type: 'text',
                  text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus tortor enim, suscipit ut luctus vel, imperdiet et ipsum. Vestibulum et tempus sem. Nam egestas ligula dui, ac rutrum justo mollis ut. Morbi facilisis nisl non ex vulputate, in facilisis elit ultricies. Etiam consequat vel lacus eget imperdiet. Integer vehicula luctus augue at tristique. Morbi dapibus malesuada erat ut commodo. Sed sit amet elit id tellus dignissim fringilla eu non odio. Fusce pellentesque libero a est bibendum mattis.',
                },
              ],
            },
            {
              type: 'paragraph',
              attrs: { uid: 'UidgrPPP009' },
              content: [
                {
                  type: 'text',
                  text: 'Sed magna lectus, rutrum at dictum vitae, consectetur id nisi. Fusce vehicula, ante eget pharetra fringilla, lacus dolor facilisis ipsum, sit amet ornare ex sapien et turpis. Integer at turpis sit amet sem egestas fringilla. Donec non elit pretium, efficitur odio eget, faucibus felis. Maecenas sollicitudin fringilla orci vel pretium. ',
                },
              ],
            },
          ],
        },
      },
    });

    const p5 = await tx.policies.create({
      data: {
        id: nanoid(),
        orgId: o1.id,
        type: 'ban',
        tech: 'php',
        content: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: { uid: 'UidgrPPP010' },
              content: [
                {
                  type: 'text',
                  text: 'Maecenas mi elit, molestie vitae molestie ut, convallis in massa. Cras sem orci, tincidunt nec sollicitudin ut, aliquam quis dui. In hac habitasse platea dictumst. Vestibulum vel efficitur elit, ut convallis purus. Donec vitae leo sem.',
                },
              ],
            },
          ],
        },
      },
    });

    await Promise.all(
      [p1, p2, p4, p5].map(async (p) => {
        await createPoliciesActivity({
          user: u1,
          action: 'Policy.created',
          target: p,
          tx,
        });
        return await tx.typeHasUsers.create({
          data: { role: 'author', userId: u1.id, policyId: p.id },
        });
      })
    );
  });
}

export async function seedPolicy(user: Users, org: Orgs) {
  const policy = await prisma.policies.create({
    data: {
      id: nanoid(),
      orgId: org.id,
      type: 'ban',
      tech: 'php',
      content: { type: 'doc', content: [] },
    },
  });
  await createPoliciesActivity({
    user,
    action: 'Policy.created',
    target: policy,
    tx: prisma,
  });

  return policy;
}
