import type { ApiBlobWithPrevious } from '@specfy/api/src/types/api';
import {
  IconChevronDown,
  IconChevronRight,
  IconExternalLink,
} from '@tabler/icons-react';
import { Button, Tag } from 'antd';
import classnames from 'classnames';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type {
  Allowed,
  BlobAndDiffs,
  ComponentBlobWithDiff,
  DocumentBlobWithDiff,
  ProjectBlobWithDiff,
} from '../../types/blobs';
import { Card } from '../Card';

import { DiffCardComponent } from './CardComponent';
import { DiffCardDocument } from './CardDocument';
import { DiffCardProject } from './CardProject';
import cls from './index.module.scss';

export const DiffCard: React.FC<{
  diff: BlobAndDiffs;
  url: string;
  onRevert: (
    type: ApiBlobWithPrevious['type'],
    typeId: ApiBlobWithPrevious['typeId'],
    key: string
  ) => void;
}> = ({ diff, url }) => {
  const using = (diff.blob.current || diff.blob.previous) as Allowed;

  const [type, to] = useMemo<[string, string]>(() => {
    if (diff.blob.type === 'project') {
      return ['Project', url];
    }

    if (diff.blob.type === 'document') {
      return ['Document', `${url}/content/${diff.blob.typeId}-${using.slug}`];
    }

    return ['Component', `${url}/c/${diff.blob.typeId}-${using.slug}`];
  }, [diff]);

  // Actions
  const [hide, setHide] = useState<boolean>(diff.blob.deleted);
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
            icon={hide ? <IconChevronRight /> : <IconChevronDown />}
          />
        </div>
        <div>
          {type} / {using.name}
        </div>
        {diff.blob.deleted && <Tag className={cls.fileDeleted}>deleted</Tag>}
        {diff.blob.created && <Tag className={cls.fileCreated}>new</Tag>}

        <Link to={to}>
          <Button type="text" icon={<IconExternalLink />} size="small" />
        </Link>
      </div>
      <div
        className={classnames(
          cls.diff,
          hide && cls.hide,
          diff.blob.deleted && cls.removed,
          diff.blob.created && cls.added
        )}
      >
        <div className={cls.diffContent}>
          {diff.blob.type === 'component' && (
            <DiffCardComponent diff={diff as ComponentBlobWithDiff} />
          )}
          {diff.blob.type === 'document' && (
            <DiffCardDocument diff={diff as DocumentBlobWithDiff} />
          )}
          {diff.blob.type === 'project' && (
            <DiffCardProject diff={diff as ProjectBlobWithDiff} />
          )}
        </div>
      </div>
    </Card>
  );
};
