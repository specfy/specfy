import { nanoid, acronymize, stringToColor } from '@specfy/core';
import { recomputeOrgGraph } from '../flows/helpers.rebuild.js';
import { createKey } from '../keys/model.js';
export async function createOrg(tx, user, data) {
    const acronym = acronymize(data.name);
    const colors = stringToColor(data.name);
    const tmp = await tx.orgs.create({
        data: {
            ...data,
            acronym,
            color: colors.palette,
        },
    });
    // Put the creator as owner
    await tx.perms.create({
        data: {
            id: nanoid(),
            orgId: data.id,
            projectId: null,
            userId: user.id,
            role: 'owner',
        },
    });
    // Log everything
    const activityGroupId = nanoid();
    await createOrgActivity({
        user,
        action: 'Org.created',
        target: tmp,
        tx,
        activityGroupId,
    });
    // Add a default api key
    await createKey({ tx, user, data: { orgId: tmp.id }, activityGroupId });
    const update = {};
    // Finally creating the associated empty flow
    const flow = await recomputeOrgGraph({ orgId: tmp.id, tx });
    update.flowId = flow.id;
    return await tx.orgs.update({
        data: update,
        where: { id: tmp.id },
    });
}
export async function createOrgActivity({ user, action, target, tx, activityGroupId = null, }) {
    return await tx.activities.create({
        data: {
            id: nanoid(),
            action,
            userId: user.id,
            orgId: target.id,
            activityGroupId,
            createdAt: new Date(),
        },
    });
}
