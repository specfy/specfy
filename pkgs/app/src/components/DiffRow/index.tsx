import { CaretDownOutlined, HistoryOutlined } from '@ant-design/icons';
import { Alert, Button } from 'antd';
import type { Change } from 'diff';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import cls from './index.module.scss';

export interface ComputedForDiff {
  type: string;
  typeId: string;
  key: string;
  original: any;
  diff: Change[];
}

export const DiffRow: React.FC<{
  comp: ComputedForDiff;
  url: string;
  onRevert: (type: string, id: string, key: string) => void;
}> = ({ comp, url, onRevert }) => {
  if (!comp.original) {
    return <Alert type="error" message="An error has ocurred" />;
  }

  const [left] = useState(() => {
    return comp.diff
      .map((d) => {
        if (d.added) return null;
        if (d.removed) return <span className={cls.removed}>{d.value}</span>;
        else return d.value;
      })
      .filter((e) => e);
  });
  const [right] = useState(() => {
    return comp.diff
      .map((d) => {
        if (d.removed) return null;
        if (d.added) return <span className={cls.added}>{d.value}</span>;
        else return d.value;
      })
      .filter((e): e is string => !!e);
  });
  const type = comp.type === 'project' ? 'Project' : 'Components';
  const to = url + (type === 'Components' ? `/c/${comp.original.slug}` : '');

  // TODO: undo revert
  return (
    <div className={cls.update}>
      <div className={cls.title}>
        <div className={cls.titleLeft}>
          <div className={cls.toggle}>
            <CaretDownOutlined />
          </div>
          <Link to={to}>
            {type} / {comp.original.name} [{comp.key}]
          </Link>
        </div>
        <div className={cls.titleRight}>
          <Button
            type="text"
            icon={<HistoryOutlined />}
            size="small"
            onClick={() => onRevert(comp.type, comp.typeId, comp.key)}
          >
            Revert
          </Button>
          {/* |<Checkbox checked>Staged</Checkbox> */}
        </div>
      </div>
      <div className={cls.diff}>
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
    </div>
  );
};
