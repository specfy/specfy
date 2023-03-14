import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { diffTwoBlob } from '../../../common/diff';
import type { Allowed, ComputedForDiff, TmpBlob } from '../../../common/store';
import originalStore, {
  useStagingStore,
  useDocumentsStore,
  useComponentsStore,
  useProjectStore,
} from '../../../common/store';

export const Staging: React.FC<{ link: string }> = ({ link }) => {
  const [count, setCount] = useState(0);
  const { project } = useProjectStore();
  const { components } = useComponentsStore();
  const { documents } = useDocumentsStore();
  const staging = useStagingStore();

  useDebounce(
    () => {
      let tmp = 0;
      const store: Allowed[] = [
        project!,
        ...Object.values(components),
        ...Object.values(documents),
      ];

      const diffs: ComputedForDiff[] = [];
      const clean: TmpBlob[] = [];

      // Find added and modified
      for (const item of store) {
        const original = originalStore.find(item.id) as typeof item;

        const diff = diffTwoBlob({
          type: originalStore.allowedType(item),
          typeId: item.id,
          blob: item,
          previous: original || null,
        } as TmpBlob);

        tmp += Object.keys(diff.clean.blob).length;
        diffs.push(...diff.computed);
        clean.push(diff.clean);
      }

      // Find deleted
      for (const item of originalStore.originalStore) {
        if (store.find((i) => i.id === item.id)) {
          continue;
        }

        const diff = diffTwoBlob({
          type: originalStore.allowedType(item),
          typeId: item.id,
          blob: { id: null } as any,
          previous: item || null,
        } as TmpBlob);

        tmp += 1;
        diffs.push(...diff.computed);
        clean.push(diff.clean);
      }

      setCount(tmp);
      staging.update(diffs, clean);
    },
    150,
    [project, components, documents]
  );

  return (
    <Link to={`${link}/revisions/current`}>
      {count} pending {count > 1 ? 'changes' : 'change'}
    </Link>
  );
};
