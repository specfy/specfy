import { IconEdit, IconEye, IconPlus } from '@tabler/icons-react';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { diffTwoBlob } from '../../../../common/diff';
import {
  originalStore,
  findOriginal,
  allowedType,
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
import { TooltipFull } from '../../../Tooltip';

import cls from './index.module.scss';

export const Staging: React.FC<{ showBadge: boolean }> = ({ showBadge }) => {
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
        const original = findOriginal(item.id)!;

        const bd: BlobAndDiffs = {
          blob: {
            id: '',
            created: !original,
            deleted: false,
            parentId: original ? original.blobId : null,
            previous: (original as any) || null,
            type: allowedType(item) as any,
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
      for (const item of originalStore) {
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
            type: allowedType(item) as any,
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

  if (!canEdit) {
    return null;
  }

  return (
    <div className={cls.staging}>
      <TooltipFull
        msg={
          isEditing
            ? 'Click to disable edition'
            : canEdit
            ? 'Click to enable edition'
            : 'You are a viewer'
        }
        side="bottom"
      >
        <button>
          {isEditing ? (
            <div
              className={classNames(
                cls.edit,
                showBadge && staging.count > 0 && cls.badge
              )}
              role="button"
              tabIndex={0}
              onClick={() => edit.enable(false)}
            >
              <IconEdit />
            </div>
          ) : (
            <div
              className={cls.edit}
              role="button"
              tabIndex={0}
              onClick={() => edit.enable(true)}
            >
              <IconEye />
            </div>
          )}
        </button>
      </TooltipFull>
      {isEditing ? (
        <Link to={`/${project!.orgId}/${project!.slug}/revisions/current`}>
          <Button display="primary" size="l">
            {staging.count} Changes
          </Button>
        </Link>
      ) : (
        <div>
          <Button onClick={() => edit.enable(true)} size="l">
            <IconEdit /> Edit
          </Button>
        </div>
      )}
      <Link to={`/${project!.orgId}/${project!.slug}/component/new`}>
        <Button size="l">
          <IconPlus />
        </Button>
      </Link>
    </div>
  );
};
