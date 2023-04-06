import { Typography } from 'antd';
import type { BlockLevelZero } from 'api/src/types/api';
import { useMemo } from 'react';

import type { DocumentBlobWithDiff } from '../../types/blobs';
import { ContentDoc } from '../Content';

import { Split } from './Split';
import { UnifiedDiff } from './Unified';
import { UnifiedContent } from './Unified/Content';
import cls from './index.module.scss';

export const DiffCardDocument: React.FC<{
  diff: DocumentBlobWithDiff;
}> = ({ diff }) => {
  const using = (diff.blob.deleted ? diff.blob.previous : diff.blob.current)!;

  const Title = useMemo(() => {
    const hasName = diff.diffs.find((d) => d.key === 'name');
    return (
      <Typography.Title level={3}>
        {hasName && !diff.blob.created ? (
          <UnifiedDiff key={hasName.key} diff={hasName} />
        ) : (
          using.name || ''
        )}
      </Typography.Title>
    );
  }, [diff]);

  if (diff.blob.deleted || diff.blob.created) {
    return (
      <div className={cls.content}>
        {Title}
        <Typography>
          <ContentDoc doc={using.content} id={diff.blob.typeId} noPlaceholder />
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
              id={diff.blob.typeId}
            />
          );
        }

        return <Split key={d.key} diff={d} created={!diff.blob.previous} />;
      })}
    </div>
  );
};
