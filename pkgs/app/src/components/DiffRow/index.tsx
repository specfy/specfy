import {
  IconCaretDown,
  IconCaretRight,
  IconHistory,
} from '@tabler/icons-react';
import { Button } from 'antd';
import classnames from 'classnames';
import type { Change } from 'diff';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { TmpBlob } from '../../hooks/useEdit';
import { Card } from '../Card';

import cls from './index.module.scss';

export interface ComputedForDiff {
  type: TmpBlob['type'];
  typeId: string;
  key: string;
  previous: any;
  diff: Change[];
}

export const DiffRow: React.FC<{
  comp: ComputedForDiff;
  url: string;
  onRevert: (type: string, id: string, key: string) => void;
}> = ({ comp, url, onRevert }) => {
  // Compute diff
  const left = useMemo(() => {
    return comp.diff
      .map((d, i) => {
        if (d.added) return null;
        if (d.removed)
          return (
            <span className={cls.removed} key={i}>
              {d.value}
            </span>
          );
        else return d.value;
      })
      .filter((e) => e);
  }, [comp]);
  const right = useMemo(() => {
    return comp.diff
      .map((d, i) => {
        if (d.removed) return null;
        if (d.added)
          return (
            <span className={cls.added} key={i}>
              {d.value}
            </span>
          );
        else return d.value;
      })
      .filter((e): e is string => !!e);
  }, [comp]);
  const type = comp.type === 'project' ? 'Project' : 'Components';
  const to = url + (type === 'Components' ? `/c/${comp.previous.slug}` : '');

  // Actions
  const [hide, setHide] = useState<boolean>(false);
  const handleHideShow = () => {
    setHide(!hide);
  };

  // TODO: undo revert
  return (
    <Card>
      <div className={cls.title}>
        <div className={cls.titleLeft}>
          <div className={cls.toggle}>
            <Button
              type="text"
              size="small"
              onClick={handleHideShow}
              icon={hide ? <IconCaretRight /> : <IconCaretDown />}
            />
          </div>
          <Link to={to}>
            {type} / {comp.previous.name} [{comp.key}]
          </Link>
        </div>
        <div className={cls.titleRight}>
          <Button
            type="text"
            icon={<IconHistory />}
            size="small"
            onClick={() => onRevert(comp.type, comp.typeId, comp.key)}
          >
            Revert
          </Button>
          {/* |<Checkbox checked>Staged</Checkbox> */}
        </div>
      </div>
      <div className={classnames(cls.diff, hide && cls.hide)}>
        <div className={cls.left}>
          {!left.length ? (
            <span className={cls.empty}>Empty...</span>
          ) : (
            <>{left}</>
          )}
        </div>
        <div className={cls.right}>
          {!right.length ? (
            <span className={cls.empty}>Deleted...</span>
          ) : (
            <>{right}</>
          )}
        </div>
      </div>
    </Card>
  );
};
