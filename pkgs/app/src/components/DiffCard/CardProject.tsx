import type { ApiProject, BlockLevelZero } from '@specfy/api/src/types/api';
import classnames from 'classnames';

import type { DiffObjectsArray, ProjectBlobWithDiff } from '../../types/blobs';
import { Link } from '../Project/Links';

import { Split } from './Split';
import { UnifiedContent } from './Unified/Content';
import cls from './index.module.scss';

export const DiffCardProject: React.FC<{
  diff: ProjectBlobWithDiff;
}> = ({ diff }) => {
  return (
    <div className={cls.content}>
      <h2>{diff.blob.current!.name}</h2>
      {diff.diffs.map((d) => {
        if (d.key === 'name') {
          return null;
        }
        if (d.key === 'description') {
          return (
            <UnifiedContent
              key={d.key}
              doc={d.diff as unknown as BlockLevelZero}
              id={diff.blob.typeId}
            />
          );
        }
        if (d.key === 'links') {
          return (
            <div key={d.key} className={classnames(cls.line)}>
              <h4>Links</h4>
              {(d.diff as DiffObjectsArray<ApiProject['links'][0]>).added.map(
                (link) => {
                  return (
                    <div key={link.url} className={cls.added}>
                      <Link
                        link={{
                          title: `${link.title || 'Link'} => ${link.url}`,
                          url: link.url,
                        }}
                      />
                    </div>
                  );
                }
              )}
              {(d.diff as DiffObjectsArray<ApiProject['links'][0]>).deleted.map(
                (link) => {
                  return (
                    <div key={link.url} className={cls.removed}>
                      <Link
                        link={{
                          title: `${link.title || 'Link'} => ${link.url}`,
                          url: link.url,
                        }}
                      />
                    </div>
                  );
                }
              )}
            </div>
          );
        }

        return <Split key={d.key} diff={d} created={!diff.blob.previous} />;
      })}
    </div>
  );
};
