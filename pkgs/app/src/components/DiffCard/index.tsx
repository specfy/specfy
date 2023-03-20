import {
  IconCaretDown,
  IconCaretRight,
  IconExternalLink,
} from '@tabler/icons-react';
import { Button, Tag, Typography } from 'antd';
import type {
  ApiBlobWithPrevious,
  ApiComponent,
  ApiDocument,
  BlockLevelZero,
} from 'api/src/types/api';
import classnames from 'classnames';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { TYPE_TO_TEXT } from '../../common/document';
import type { Allowed, ComputedForDiff } from '../../common/store';
import { Card } from '../Card';
import { ContentDoc } from '../Content';

import { Split } from './Split';
import { UnifiedDiff } from './Unified';
import { UnifiedContent } from './Unified/Content';
import cls from './index.module.scss';

export type BlobWithDiff = ApiBlobWithPrevious & { diffs: ComputedForDiff[] };

const DiffCardComponent: React.FC<{
  diff: BlobWithDiff;
}> = ({ diff }) => {
  if (diff.deleted) {
    return (
      <>
        <div className={cls.fileDeleted}>Component deleted</div>
        <div className={cls.content}>
          <ContentDoc
            doc={(diff.previous as ApiComponent).description}
            id={diff.typeId}
          />
        </div>
      </>
    );
  }

  return (
    <>
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
              // created={!diff.previous}
            />
          );
        }
        if (d.key === 'display') {
          return <div key={d.key}>Modified display in Graph</div>;
        }

        return <Split key={d.key} diff={d} created={!diff.previous} />;
      })}
    </>
  );
};

const DiffCardDocument: React.FC<{
  diff: BlobWithDiff;
}> = ({ diff }) => {
  if (diff.deleted) {
    return (
      <>
        <div className={cls.fileDeleted}>Document deleted</div>
        <div className={cls.content}>
          <ContentDoc
            doc={(diff.previous as ApiDocument).content}
            id={diff.typeId}
          />
        </div>
      </>
    );
  }
  if (diff.created) {
    return (
      <>
        <div className={cls.content}>
          <ContentDoc
            doc={(diff.blob as ApiDocument).content}
            id={diff.typeId}
          />
        </div>
      </>
    );
  }

  return (
    <>
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
              // created={!diff.previous}
            />
          );
        }

        return <Split key={d.key} diff={d} created={!diff.previous} />;
      })}
    </>
  );
};

const DiffCardProject: React.FC<{
  diff: BlobWithDiff;
}> = ({ diff }) => {
  return (
    <>
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
              // created={!diff.previous}
            />
          );
        }

        return <Split key={d.key} diff={d} created={!diff.previous} />;
      })}
    </>
  );
};

export const DiffCard: React.FC<{
  diff: BlobWithDiff;
  url: string;
  onRevert: (
    type: ApiBlobWithPrevious['type'],
    typeId: ApiBlobWithPrevious['typeId'],
    key: string
  ) => void;
}> = ({ diff, url, onRevert }) => {
  const using = (diff.blob || diff.previous) as Allowed;

  const [type, to] = useMemo<[string, string]>(() => {
    if (diff.type === 'project') {
      return ['Project', url];
    }

    if (diff.type === 'document') {
      return ['Documents', `${url}/content/${diff.typeId}-${using.slug}`];
    }

    return ['Components', `/c/${diff.typeId}-${using.slug}`];
  }, [diff]);

  const hasName = useMemo(() => {
    return diff.diffs.find((d) => d.key === 'name');
  }, [diff]);

  // Actions
  const [hide, setHide] = useState<boolean>(false);
  const handleHideShow = () => {
    setHide(!hide);
  };

  return (
    <Card>
      <div className={cls.header}>
        <div>
          <Button
            type="text"
            size="small"
            onClick={handleHideShow}
            icon={hide ? <IconCaretRight /> : <IconCaretDown />}
          />
        </div>
        <Tag>
          {type} / {using.name}
        </Tag>

        <Link to={to}>
          <Button type="text" icon={<IconExternalLink />} size="small"></Button>
        </Link>
      </div>
      <div
        className={classnames(
          cls.diff,
          hide && cls.hide,
          diff.deleted && cls.removed,
          diff.created && cls.added,
          cls.unified
        )}
      >
        <div className={cls.diffContent}>
          <Typography.Title level={3} className={cls.title}>
            <>
              {'content' in using && (
                <>
                  {TYPE_TO_TEXT[using.type]} - {using.typeId} -{' '}
                </>
              )}

              {hasName && !diff.created ? (
                <UnifiedDiff
                  key={hasName.key}
                  diff={hasName}
                  // hideLabel={true}
                  // created={!diff.parentId}
                />
              ) : (
                using.name || ''
              )}
            </>
          </Typography.Title>

          {diff.type === 'component' && <DiffCardComponent diff={diff} />}
          {diff.type === 'document' && <DiffCardDocument diff={diff} />}
          {diff.type === 'project' && <DiffCardProject diff={diff} />}
        </div>
      </div>
    </Card>
  );
};
