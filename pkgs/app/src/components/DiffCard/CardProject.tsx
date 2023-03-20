import { Typography } from 'antd';
import type { ApiBlobPrevious, BlockLevelZero } from 'api/src/types/api';
import type { DBBlobProject, DBProject } from 'api/src/types/db';

import type { ComputedForDiff } from '../../common/store';

import { Split } from './Split';
import { UnifiedContent } from './Unified/Content';
import cls from './index.module.scss';

export type BlobWithDiff = ApiBlobPrevious<DBProject> &
  DBBlobProject & { diffs: ComputedForDiff[] };

export const DiffCardProject: React.FC<{
  diff: BlobWithDiff;
}> = ({ diff }) => {
  return (
    <div className={cls.content}>
      <Typography.Title level={3}>{diff.blob!.name}</Typography.Title>
      {diff.diffs.map((d) => {
        if (d.key === 'name') {
          return null;
        }
        if (d.key === 'description') {
          return (
            <UnifiedContent
              key={d.key}
              doc={d.diff as unknown as BlockLevelZero}
              id={diff.typeId}
            />
          );
        }

        return <Split key={d.key} diff={d} created={!diff.previous} />;
      })}
    </div>
  );
};
