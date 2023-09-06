import type { BlockLevelZero } from '@specfy/models';
import { useMemo } from 'react';

import type { DocumentBlobWithDiff } from '../../../types/blobs';
import { ContentDoc, Presentation } from '../../Content';

import { Split } from './Split';
import { UnifiedDiff } from './Unified';
import { UnifiedContent } from './Unified/Content';
import cls from './index.module.scss';

export const DiffCardDocument: React.FC<{
  diff: DocumentBlobWithDiff;
}> = ({ diff }) => {
  const using = diff.blob.current;

  const Title = useMemo(() => {
    const hasName = diff.diffs.find((d) => d.key === 'name');
    return (
      <h2>
        {hasName && !diff.blob.created ? (
          <UnifiedDiff key={hasName.key} diff={hasName} />
        ) : (
          using.name || ''
        )}
      </h2>
    );
  }, [diff]);

  const content = useMemo<BlockLevelZero | string>(() => {
    return using.format === 'pm' ? JSON.parse(using.content) : using.content;
  }, []);

  if (diff.blob.deleted || diff.blob.created) {
    return (
      <div className={cls.content}>
        {Title}
        <Presentation>
          {typeof content == 'string' ? (
            content
          ) : (
            <ContentDoc
              doc={content}
              id={diff.blob.typeId}
              placeholder={false}
            />
          )}
        </Presentation>
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
