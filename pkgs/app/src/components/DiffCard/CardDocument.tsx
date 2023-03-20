import { Typography } from 'antd';
import type { ApiBlobPrevious, BlockLevelZero } from 'api/src/types/api';
import type { DBBlobDocument, DBDocument } from 'api/src/types/db';
import { useMemo } from 'react';

import type { ComputedForDiff } from '../../common/store';
import { ContentDoc } from '../Content';

import { Split } from './Split';
import { UnifiedDiff } from './Unified';
import { UnifiedContent } from './Unified/Content';
import cls from './index.module.scss';

export type BlobWithDiff = ApiBlobPrevious<DBDocument> &
  DBBlobDocument & { diffs: ComputedForDiff[] };

export const DiffCardDocument: React.FC<{
  diff: BlobWithDiff;
}> = ({ diff }) => {
  const using = (diff.deleted ? diff.previous : diff.blob)!;

  const Title = useMemo(() => {
    const hasName = diff.diffs.find((d) => d.key === 'name');
    return (
      <Typography.Title level={3}>
        {hasName && !diff.created ? (
          <UnifiedDiff key={hasName.key} diff={hasName} />
        ) : (
          using.name || ''
        )}
      </Typography.Title>
    );
  }, [diff]);

  if (diff.deleted || diff.created) {
    return (
      <div className={cls.content}>
        {Title}
        <Typography>
          <ContentDoc doc={using.content} id={diff.typeId} />
        </Typography>
      </div>
    );
  }

  return (
    <div className={cls.content}>
      {Title}
      {diff.diffs.map((d) => {
        if (d.key === 'name') {
          return null;
        }
        if (d.key === 'content') {
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
