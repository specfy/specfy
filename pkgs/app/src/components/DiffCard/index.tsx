import {
  IconCaretDown,
  IconCaretRight,
  IconExternalLink,
} from '@tabler/icons-react';
import { Button, Tag, Typography } from 'antd';
import type { ApiBlobWithPrevious } from 'api/src/types/api';
import classnames from 'classnames';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { ComputedForDiff } from '../../common/store';
import { Card } from '../Card';

import { Split } from './Split';
import cls from './index.module.scss';

export type BlobWithDiff = ApiBlobWithPrevious & { diffs: ComputedForDiff[] };

export const DiffCard: React.FC<{
  diff: BlobWithDiff;
  url: string;
  onRevert: (
    type: ApiBlobWithPrevious['type'],
    typeId: ApiBlobWithPrevious['typeId'],
    key: string
  ) => void;
}> = ({ diff, url, onRevert }) => {
  const [type, to] = useMemo<[string, string]>(() => {
    if (diff.type === 'project') {
      return ['Project', url];
    }

    if (diff.type === 'document') {
      return [
        'Documents',
        `${url}/content/${diff.typeId}-${
          diff.blob ? diff.blob.slug : diff.previous!.slug
        }`,
      ];
    }

    return [
      'Components',
      `/c/${diff.typeId}-${diff.previous?.slug || diff.blob!.slug}`,
    ];
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
        <Tag>{type}</Tag>

        <Link to={to}>
          <Button type="text" icon={<IconExternalLink />} size="small"></Button>
        </Link>
      </div>
      <div className={classnames(cls.diff, hide && cls.hide)}>
        {hasName && (
          <Typography.Title level={3}>
            <Split key={hasName.key} diff={hasName} />
          </Typography.Title>
        )}
        {!hasName && (
          <Typography.Title level={3} className={cls.unmodifiedTitle}>
            {diff.previous?.name || diff.blob?.name || ''}
          </Typography.Title>
        )}
        {diff.diffs.map((d) => {
          if (d.key === 'name') {
            return null;
          }

          return <Split key={d.key} diff={d} />;
        })}
      </div>
    </Card>
  );
};
