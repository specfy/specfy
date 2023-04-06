import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { diffTwoBlob } from '../../../common/diff';
import originalStore, {
  useStagingStore,
  useDocumentsStore,
  useComponentsStore,
  useProjectStore,
} from '../../../common/store';
import type { Allowed, BlobAndDiffs } from '../../../types/blobs';
import { Time } from '../../Time';

import cls from './index.module.scss';

export const Staging: React.FC<{ link: string }> = ({ link }) => {
  const { project } = useProjectStore();
  const { components } = useComponentsStore();
  const { documents } = useDocumentsStore();
  const staging = useStagingStore();

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

  return (
    <div className={cls.staging}>
      {staging.count > 0 ? (
        <Link to={`${link}/revisions/current`}>
          <Button type="default" size="small">
            {staging.count} pending {staging.count > 1 ? 'changes' : 'change'}
          </Button>
        </Link>
      ) : (
        <div className={cls.updated}>
          Updated <Time time={project!.updatedAt} />
        </div>
      )}
    </div>
  );
};
