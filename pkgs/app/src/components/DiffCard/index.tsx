import {
  IconCaretDown,
  IconCaretRight,
  IconExternalLink,
} from '@tabler/icons-react';
import { Button, Tag } from 'antd';
import type { ApiBlobWithPrevious } from 'api/src/types/api';
import classnames from 'classnames';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { Allowed, BlobWithDiff } from '../../types/blobs';
import { Card } from '../Card';

import { DiffCardComponent } from './CardComponent';
import { DiffCardDocument } from './CardDocument';
import { DiffCardProject } from './CardProject';
import cls from './index.module.scss';

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
      return ['Document', `${url}/content/${diff.typeId}-${using.slug}`];
    }

    return ['Component', `${url}/c/${diff.typeId}-${using.slug}`];
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
          diff.created && cls.added
        )}
      >
        <div className={cls.diffContent}>
          {diff.deleted && (
            <div className={cls.fileDeleted}>{type} deleted</div>
          )}
          {diff.type === 'component' && <DiffCardComponent diff={diff} />}
          {diff.type === 'document' && <DiffCardDocument diff={diff} />}
          {diff.type === 'project' && <DiffCardProject diff={diff} />}
        </div>
      </div>
    </Card>
  );
};
