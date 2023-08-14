import { Prisma } from '@prisma/client';
import type { Users, Orgs } from '@prisma/client';

import { prisma } from '../../db/index.js';

import { BILLING_ENABLED } from './constants.js';
import { v1 } from './plans.js';
import { stripe } from './stripe.js';
import type { GetBillingUsage } from './types.api.js';

export async function getUsage(
  org: Orgs
): Promise<GetBillingUsage['Success']['data']> {
  const res = await prisma.$queryRaw<
    [{ Projects: number; Deploy: number; Users: number }]
  >(
    Prisma.sql`SELECT
      (SELECT COUNT(*) FROM "Projects" WHERE "orgId" = ${org.id})::int as "Projects",
      (SELECT COUNT(*) FROM "Jobs" WHERE "orgId" = ${org.id} AND "type" = 'deploy' AND "createdAt" >= "Orgs"."stripeCurrentPeriodStart")::int as "Deploy",
      (SELECT COUNT(*) FROM "Perms" WHERE "orgId" = ${org.id} AND "projectId" IS NULL)::int
        + (SELECT COUNT(*) FROM "Invitations" WHERE "orgId" = ${org.id})::int as "Users"
      FROM "Orgs" WHERE "Orgs"."id" = ${org.id}
      LIMIT 1`
  );

  const counts = res[0];
  const plan =
    Object.values(v1).find((p) => p.id === org.currentPlanId) || v1.free;

  const usage: GetBillingUsage['Success']['data'] = {
    projects: {
      name: 'Projects',
      current: counts.Projects || 0,
      max: plan.project.max,
      pct: counts.Projects
        ? Math.round((counts.Projects / plan.project.max) * 100)
        : 0,
    },
    users: {
      name: 'Users',
      current: counts.Users || 0,
      max: plan.user.max,
      pct: counts.Users ? Math.round((counts.Users / plan.user.max) * 100) : 0,
    },
    deploy: {
      name: 'Deploy',
      current: counts.Deploy || 0,
      max: plan.deploy.max,
      pct: counts.Deploy
        ? Math.round((counts.Deploy / plan.deploy.max) * 100)
        : 0,
    },
  };

  return usage;
}

export async function createFreeSubscription({
  org,
  me,
}: {
  org: Orgs;
  me: Users;
}) {
  if (!BILLING_ENABLED) {
    return;
  }

  console.log('Subscribing org to default Free plan');
  const search = await stripe.customers.search({
    query: `metadata["orgId"]:"${org.id}"`,
  });

  const update: Prisma.OrgsUncheckedUpdateInput = {};
  if (search.data.length <= 0) {
    const customer = await stripe.customers.create({
      name: me.name,
      email: me.email,
      metadata: {
        orgId: org.id,
      },
    });
    update.stripeCustomerId = customer.id;
  } else {
    update.stripeCustomerId = search.data[0].id;
  }

  const prices = await stripe.prices.list({
    lookup_keys: [v1.free.price.key],
    expand: ['data.product'],
  });
  if (prices.data.length !== 1) {
    throw new Error('Could not setup subscription, pricing not found');
  }

  const sub = await stripe.subscriptions.create({
    customer: update.stripeCustomerId,
    items: [
      {
        price: prices.data[0].id,
      },
    ],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  });
  update.stripePriceId = prices.data[0].id;
  update.stripeSubscriptionId = sub.id;
  update.stripeCurrentPeriodStart = new Date(sub.current_period_start * 1000);
  update.stripeCurrentPeriodEnd = new Date(sub.current_period_end * 1000);
  update.currentPlanId = v1.free.id;

  return await prisma.orgs.update({
    data: update,
    where: { id: org.id },
  });
}
