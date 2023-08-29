import { IconEdit, IconEye, IconPlus } from '@tabler/icons-react';
import { useCallback } from 'react';
import { Link, useBeforeUnload } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { diffTwoBlob } from '../../../../common/diff';
import {
  original,
  useStagingStore,
  useDocumentsStore,
  useComponentsStore,
  useProjectStore,
} from '../../../../common/store';
import { useAuth } from '../../../../hooks/useAuth';
import { useEdit } from '../../../../hooks/useEdit';
import type {
  Allowed,
  BlobAndDiffs,
  ComponentBlobWithDiff,
} from '../../../../types/blobs';
import { Button } from '../../../Form/Button';

import cls from './index.module.scss';

export const Staging: React.FC<{ showBadge: boolean }> = () => {
  const edit = useEdit();
  const { currentPerm } = useAuth();
  const { project } = useProjectStore();
  const { components } = useComponentsStore();
  const { documents } = useDocumentsStore();
  const staging = useStagingStore();
  const isEditing = edit.isEditing;
  const canEdit = currentPerm?.role !== 'viewer';

  useDebounce(
    () => {
      if (!project) {
        return;
      }

      let count = 0;
      const store: Allowed[] = [
        project!,
        ...Object.values(components),
        ...Object.values(documents),
      ];

      const bds: BlobAndDiffs[] = [];
      let hasGraphChanged = false;

      // Find added and modified
      for (const item of store) {
        const ori = original.find(item.id)!;

        const bd: BlobAndDiffs = {
          blob: {
            id: '',
            created: !ori,
            deleted: false,
            parentId: ori ? ori.blobId : null,
            previous: (ori as any) || null,
            type: original.allowedType(item) as any,
            typeId: item.id,
            current: item as any, // Can't fix this
            createdAt: '',
            updatedAt: '',
          },
          diffs: [],
        };
        const diffs = diffTwoBlob(bd.blob);

        if (diffs.length <= 0) {
          continue;
        }

        // Compute a global flag to know if the graph has potentially changed
        if (bd.blob.type === 'component' && !hasGraphChanged) {
          const has = (diffs as ComponentBlobWithDiff['diffs']).find(
            (diff) =>
              diff.key === 'edges' ||
              diff.key === 'display' ||
              diff.key === 'inComponent'
          );
          if (has) hasGraphChanged = true;
        }

        // clean.push(diff.clean);
        count += original ? diffs.length : 1;
        bd.diffs = diffs;
        bds.push(bd);
      }

      // Find deleted
      for (const item of original.store) {
        // ignore others item
        if ('projectId' in item && item.projectId !== project!.id) {
          continue;
        }
        // ignore other projects
        if ('links' in item && item.id !== project!.id) {
          continue;
        }
        if (store.find((i) => i.id === item.id)) {
          continue;
        }

        const bd: BlobAndDiffs = {
          blob: {
            id: '',
            created: false,
            deleted: true,
            parentId: item.blobId,
            type: original.allowedType(item) as any,
            typeId: item.id,
            current: item as any,
            previous: item as any,
            createdAt: '',
            updatedAt: '',
          },
          diffs: [],
        };
        const diffs = diffTwoBlob(bd.blob);

        if (bd.blob.type === 'component' && !hasGraphChanged) {
          hasGraphChanged = true;
        }

        count += 1;
        bd.diffs = diffs;
        bds.push(bd);
      }

      staging.update(bds, count, hasGraphChanged);
    },
    150,
    [project, components, documents]
  );

  // On reload or quit page block
  useBeforeUnload(
    useCallback(
      (e: BeforeUnloadEvent) => {
        if (staging.count > 0) {
          e.preventDefault();
          e.returnValue = '';
        }
      },
      [staging.count]
    )
  );

  if (!canEdit || !project) {
    return null;
  }

  return (
    <div className={cls.staging}>
      {isEditing ? (
        <Button onClick={() => edit.enable(false)} size="l" display="ghost">
          <IconEdit /> Editing
        </Button>
      ) : (
        <Button onClick={() => edit.enable(true)} size="l" display="ghost">
          <IconEye /> Viewing
        </Button>
      )}
      <div className={cls.action}>
        {staging.count > 0 && (
          <Link to={`/${project!.orgId}/${project!.slug}/revisions/current`}>
            <Button display="primary" size="s">
              {staging.count} Changes
            </Button>
          </Link>
        )}
        <Link to={`/${project!.orgId}/${project!.slug}/component/new`}>
          <Button size="s">
            <IconPlus />
          </Button>
        </Link>
      </div>
    </div>
  );
};
