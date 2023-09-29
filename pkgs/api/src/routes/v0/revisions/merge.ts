import { l, nanoid, omit } from '@specfy/core';
import { prisma } from '@specfy/db';
import {
  findAllBlobsWithParent,
  recomputeOrgGraph,
  createComponentActivity,
  createDocumentActivity,
  createProjectActivity,
  createRevisionActivity,
  checkReviews,
  flagRevisionApprovalEnabled,
  IGNORED_PROJECT_KEYS,
  hasProjectComponentChanges,
  IGNORED_COMPONENT_KEYS_MERGE,
  IGNORED_DOCUMENT_KEYS_MERGE,
  createJobProjectIndex,
} from '@specfy/models';

import type { Prisma } from '@specfy/db';
import type { DBBlob, MergeRevision, MergeRevisionError } from '@specfy/models';

import { getRevision } from '../../../middlewares/getRevision.js';
import { noBody } from '../../../middlewares/noBody.js';

import type { FastifyPluginCallback } from 'fastify';

const fn: FastifyPluginCallback = (fastify, _, done) => {
  fastify.post<MergeRevision>(
    '/',
    { preHandler: [noBody, getRevision] },
    async function (req, res) {
      const rev = req.revision!;
      let reason: MergeRevisionError['error']['reason'] | false = false;
      const me = req.me!;

      await prisma.$transaction(async (tx) => {
        // Check if we have reviews
        if (flagRevisionApprovalEnabled) {
          const reviews = await checkReviews(rev, tx);
          if (!reviews.check || rev.status !== 'approved') {
            reason = 'no_reviews';
            return;
          }
        }

        if (rev.merged) {
          reason = 'already_merged';
          return;
        }

        if (rev.blobs.length === 0) {
          reason = 'empty';
          return;
        }

        // TODO: check who can merge

        // Update revision
        // Merge first to activity ordering
        const activityGroupId = nanoid();
        const updated = await tx.revisions.update({
          data: { merged: true, mergedAt: new Date().toISOString() },
          where: { id: rev.id },
        });
        await createRevisionActivity({
          user: me,
          action: 'Revision.merged',
          target: updated,
          activityGroupId,
          tx,
        });

        // Merge all blobs
        const list = await findAllBlobsWithParent(rev.blobs, tx, true);
        for (const item of list) {
          // If we can't find the prev, that means it's not longer in the main branch
          if (!item.parent && item.blob.parentId) {
            reason = 'outdated';
            return;
          }

          // Update a blob
          const blob = item.blob;

          // --- Projects
          if (blob.type === 'project') {
            if (blob.deleted) {
              const del = await tx.projects.delete({
                where: { id: blob.typeId },
              });
              await createProjectActivity({
                user: me,
                action: 'Project.deleted',
                target: del,
                activityGroupId,
                tx,
              });
              continue;
            } else if (item.parent) {
              const up = await tx.projects.update({
                data: {
                  ...omit(item.blob.current as any, IGNORED_PROJECT_KEYS),
                  blobId: item.blob.id,
                },
                where: { id: blob.typeId },
              });
              await createProjectActivity({
                user: me,
                action: 'Project.updated',
                target: up,
                activityGroupId,
                tx,
              });
              continue;
            }

            // Can't happen
            throw new Error(
              `Trying to create a project in revision ${rev.id}::${blob.id}`
            );
          }

          // --- Components
          if (blob.type === 'component') {
            if (item.blob.deleted) {
              const del = await tx.components.delete({
                where: { id: blob.typeId },
              });
              await createComponentActivity({
                user: me,
                action: 'Component.deleted',
                target: del,
                activityGroupId,
                tx,
              });
              continue;
            } else if (item.parent) {
              const curr = item.blob
                .current as Prisma.ComponentsUncheckedUpdateInput;
              const up = await tx.components.update({
                data: {
                  ...omit(curr, IGNORED_COMPONENT_KEYS_MERGE),
                  blobId: item.blob.id,
                },
                where: { id: blob.typeId },
              });
              await createComponentActivity({
                user: me,
                action: 'Component.updated',
                target: up,
                activityGroupId,
                tx,
              });
              continue;
            }

            const created = await tx.components.create({
              data: {
                ...(blob.current as unknown as Prisma.ComponentsUncheckedCreateInput),
                blobId: blob.id,
              },
            });

            await createComponentActivity({
              user: me,
              action: 'Component.created',
              target: created,
              activityGroupId,
              tx,
            });
            continue;
          }

          // --- Documents
          if (blob.type === 'document') {
            if (blob.deleted) {
              const del = await tx.documents.delete({
                where: { id: blob.typeId },
              });
              await createDocumentActivity({
                user: me,
                action: 'Document.deleted',
                target: del,
                activityGroupId,
                tx,
              });
              continue;
            } else if (item.parent) {
              const up = await tx.documents.update({
                data: {
                  ...omit(
                    item.blob.current as any,
                    IGNORED_DOCUMENT_KEYS_MERGE
                  ),
                  blobId: item.blob.id,
                },
                where: { id: blob.typeId },
              });
              await createDocumentActivity({
                user: me,
                action: 'Document.updated',
                target: up,
                activityGroupId,
                tx,
              });
              continue;
            }

            const created = await tx.documents.create({
              data: {
                ...(blob.current as unknown as Prisma.DocumentsUncheckedCreateInput),
                blobId: blob.id,
              },
            });
            await createDocumentActivity({
              user: me,
              action: 'Document.created',
              target: created,
              activityGroupId,
              tx,
            });
          }
        }

        // Check organization graph
        const hasChangedProjects = await hasProjectComponentChanges(
          rev.projectId,
          list.map(({ blob }) => {
            return blob;
          }) as unknown as DBBlob[],
          tx
        );
        if (hasChangedProjects) {
          // If so we recompute every relationships an update the Projects' edges
          await recomputeOrgGraph({ orgId: rev.orgId, tx });
        } else {
          l.info('Merged', { rev: rev.id, hasChangedProjects });
        }
      });

      if (reason) {
        return res.status(400).send({
          error: {
            code: 'cant_merge',
            reason,
          },
        });
      }

      await prisma.projects.update({
        data: { updatedAt: new Date() },
        where: { id: rev.projectId },
      });

      createJobProjectIndex({
        orgId: rev.orgId,
        projectId: rev.projectId,
        userId: me.id,
        config: {},
        tx: prisma,
      });

      // if (rev.stack) {
      //   try {
      //     // TODO: do that async
      //     const project = await prisma.projects.findUnique({
      //       where: { id: rev.projectId },
      //     });
      //     await mergeStack({ project: project!, stack: rev.stack });
      //   } catch (err) {
      //     sentry.captureException(err);
      //   }
      // }

      return res.status(200).send({
        data: {
          done: true,
        },
      });
    }
  );
  done();
};

export default fn;
