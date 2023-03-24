import { Button } from 'antd';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { diffTwoBlob } from '../../../common/diff';
import type { Allowed } from '../../../common/store';
import originalStore, {
  useStagingStore,
  useDocumentsStore,
  useComponentsStore,
  useProjectStore,
} from '../../../common/store';
import type { BlobWithDiff } from '../../DiffCard';
import { Time } from '../../Time';

import cls from './index.module.scss';

export const Staging: React.FC<{ link: string }> = ({ link }) => {
  const [count, setCount] = useState(0);
  const { project } = useProjectStore();
  const { components } = useComponentsStore();
  const { documents } = useDocumentsStore();
  const staging = useStagingStore();

  useDebounce(
    () => {
      // TODO: this is too slow
      // TODO: remove HTML diff it's broken

      let tmp = 0;
      const store: Allowed[] = [
        project!,
        ...Object.values(components),
        ...Object.values(documents),
      ];

      const diffs: BlobWithDiff[] = [];

      // Find added and modified
      for (const item of store) {
        const original = originalStore.find(item.id) as typeof item;

        const diff = diffTwoBlob({
          id: '',
          orgId: item.orgId || original.orgId,
          projectId: 'links' in item ? item.id : item.projectId,
          created: !original,
          deleted: false,
          parentId: original ? original.blobId : null,
          previous: original || null,
          type: originalStore.allowedType(item),
          typeId: item.id,
          blob: item as any, // Can't fix this
          createdAt: '',
          updatedAt: '',
        });

        if (diff.diffs.length <= 0) {
          continue;
        }

        // clean.push(diff.clean);
        tmp += diff.diffs.length;
        diffs.push(diff);
      }

      // Find deleted
      for (const item of originalStore.originalStore) {
        // ignore others projects
        if ('projectId' in item && item.projectId !== project!.id) {
          continue;
        }
        // ignore project
        if ('links' in item && item.id !== project!.id) {
          continue;
        }
        if (store.find((i) => i.id === item.id)) {
          continue;
        }

        const diff = diffTwoBlob({
          id: '',
          orgId: item.orgId,
          projectId: 'links' in item ? item.id : item.projectId,
          created: false,
          deleted: true,
          parentId: item.blobId,
          type: originalStore.allowedType(item),
          typeId: item.id,
          blob: null,
          previous: item || null,
          createdAt: '',
          updatedAt: '',
        });

        tmp += 1;
        diffs.push(diff);
      }

      setCount(tmp);
      staging.update(diffs);
    },
    150,
    [project, components, documents]
  );

  return (
    <div className={cls.staging}>
      {count > 0 ? (
        <Link to={`${link}/revisions/current`}>
          <Button type="default" size="small">
            {count} pending {count > 1 ? 'changes' : 'change'}
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
