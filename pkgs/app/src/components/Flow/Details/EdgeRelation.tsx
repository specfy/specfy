import type {
  ComputedEdge,
  ComputedNode,
} from '@specfy/api/src/common/flow/types';
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconArrowsExchange,
} from '@tabler/icons-react';
import { Button, Tooltip } from 'antd';
import classNames from 'classnames';

import cls from './index.module.scss';

export interface Relation {
  edge: ComputedEdge;
  source?: ComputedNode;
  target?: ComputedNode;
}

export const EdgeRelation: React.FC<
  Relation & {
    readonly: boolean;
    onDirection: (rel: Relation) => void;
  }
> = ({ edge, source, target, readonly, onDirection }) => {
  const onClick: React.ComponentProps<typeof Button>['onClick'] = (e) => {
    e.preventDefault();
    if (readonly) {
      return;
    }

    onDirection({ edge, source, target });
  };

  return (
    <tr className={classNames(cls.relation)}>
      <td className={cls.source}>{source?.data.name}</td>

      <td className={cls.to}>
        <Tooltip
          title={!readonly && 'Click to change direction'}
          placement="left"
        >
          {edge.data!.write && edge.data!.read && (
            <Button
              className={cls.direction}
              size="small"
              type="ghost"
              onClick={onClick}
              disabled={readonly}
            >
              <IconArrowsExchange />
              <span className={cls.english}>read/write</span>
            </Button>
          )}
          {!edge.data!.write && edge.data!.read && (
            <Button
              className={cls.direction}
              size="small"
              type="ghost"
              onClick={onClick}
              disabled={readonly}
            >
              <IconArrowNarrowLeft />
              <span className={cls.english}>read</span>
            </Button>
          )}
          {edge.data!.write && !edge.data!.read && (
            <Button
              className={cls.direction}
              size="small"
              type="ghost"
              onClick={onClick}
              disabled={readonly}
            >
              <IconArrowNarrowRight />
              <span className={cls.english}>write</span>
            </Button>
          )}
        </Tooltip>
      </td>
      {target && <td className={cls.target}>{target.data.name}</td>}
    </tr>
  );
};
