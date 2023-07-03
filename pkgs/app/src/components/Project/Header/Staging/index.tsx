import { IconEdit, IconEye, IconPlus } from '@tabler/icons-react';
import { Badge, Button, Tooltip } from 'antd';
import { Link } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { diffTwoBlob } from '../../../../common/diff';
import originalStore, {
  useStagingStore,
  useDocumentsStore,
  useComponentsStore,
  useProjectStore,
} from '../../../../common/store';
import { useEdit } from '../../../../hooks/useEdit';
import type { Allowed, BlobAndDiffs } from '../../../../types/blobs';

import cls from './index.module.scss';

export const Staging: React.FC<{ showBadge: boolean }> = ({ showBadge }) => {
  const edit = useEdit();
  const { project } = useProjectStore();
  const { components } = useComponentsStore();
  const { documents } = useDocumentsStore();
  const staging = useStagingStore();
  const isEditing = edit.isEditing;

  useDebounce(
    () => {
      let count = 0;
      const store: Allowed[] = [
        project!,
        ...Object.values(components),
        ...Object.values(documents),
      ];

      const bds: BlobAndDiffs[] = [];

      // Find added and modified
      for (const item of store) {
        const original = originalStore.find(item.id) as typeof item;

        const bd: BlobAndDiffs = {
          blob: {
            id: '',
            created: !original,
            deleted: false,
            parentId: original ? original.blobId : null,
            previous: (original as any) || null,
            type: originalStore.allowedType(item) as any,
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

        // clean.push(diff.clean);
        count += original ? diffs.length : 1;
        bd.diffs = diffs;
        bds.push(bd);
      }

      // Find deleted
      for (const item of originalStore.originalStore) {
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
            type: originalStore.allowedType(item) as any,
            typeId: item.id,
            current: null,
            previous: (item as any) || null,
            createdAt: '',
            updatedAt: '',
          },
          diffs: [],
        };
        const diffs = diffTwoBlob(bd.blob);

        count += 1;
        bd.diffs = diffs;
        bds.push(bd);
      }

      staging.update(bds, count);
    },
    150,
    [project, components, documents]
  );

  if (!edit.can) {
    return null;
  }

  return (
    <div className={cls.staging}>
      <Tooltip
        title={
          isEditing ? 'Click to disable edition' : 'Click to enable edition'
        }
        placement="bottomLeft"
      >
        {isEditing ? (
          <Badge
            className={cls.badge}
            count={showBadge ? staging.count : 0}
            size="small"
            color="hsl(226, 70.0%, 55.5%)"
          >
            <div
              className={cls.edit}
              role="button"
              tabIndex={0}
              onClick={() => edit.enable(false)}
            >
              <IconEdit />
            </div>
          </Badge>
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
      </Tooltip>
      {isEditing ? (
        <Link to={`/${project!.orgId}/${project!.slug}/revisions/current`}>
          <Badge
            count={staging.count}
            size="small"
            color="hsl(226, 70.0%, 55.5%)"
          >
            <Button type="primary">Changes</Button>
          </Badge>
        </Link>
      ) : (
        <div>
          <Button icon={<IconEdit />} onClick={() => edit.enable(true)}>
            Edit
          </Button>
        </div>
      )}
      <Link to={`/${project!.orgId}/${project!.slug}/component/new`}>
        <Button icon={<IconPlus />} />
      </Link>
    </div>
  );
};
