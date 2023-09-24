import type { ComputedEdge, ComputedNode } from '@specfy/models';
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconArrowsExchange,
  IconDotsVertical,
  IconEye,
  IconEyeOff,
  IconTrash,
} from '@tabler/icons-react';
import classNames from 'classnames';

import * as Dropdown from '../../../components/Dropdown';
import { Button } from '../../Form/Button';
import { TooltipFull } from '../../Tooltip';
import type { OnEdgesChangeSuper } from '../types';

import cls from './edge.module.scss';

import { useEdit } from '@/hooks/useEdit';

export interface Relation {
  edge: ComputedEdge;
  source?: ComputedNode;
  target?: ComputedNode;
}

export const EdgeRelation: React.FC<
  Relation & {
    readonly: boolean;
    onEdgesChange?: OnEdgesChangeSuper;
  }
> = ({ edge, source, target, readonly, onEdgesChange }) => {
  const edit = useEdit();

  const onDirection = () => {
    let read = edge.data!.read;
    let write = edge.data!.write;
    if (write && read) {
      write = false;
    } else if (!write && read) {
      read = false;
      write = true;
    } else {
      read = true;
      write = true;
    }

    onEdgesChange!([{ type: 'direction', id: edge.id, read, write }]);
  };

  const onRemove = () => {
    edit.enable(true);
    onEdgesChange!([{ type: 'remove', id: edge.id }]);
  };

  const onVisibility = () => {
    edit.enable(true);
    onEdgesChange!([{ type: 'visibility', id: edge.id }]);
  };

  return (
    <tr className={classNames(cls.relation, edge.hidden && cls.hidden)}>
      <td className={cls.source}>{source?.data.name}</td>

      <td className={cls.to}>
        <TooltipFull msg={!readonly && 'Click to change direction'} side="left">
          <div>
            <Button
              className={cls.direction}
              size="s"
              display="ghost"
              onClick={onDirection}
              disabled={readonly}
            >
              {edge.data!.write && edge.data!.read && (
                <>
                  <IconArrowsExchange />
                  <span className={cls.english}>read/write</span>
                </>
              )}
              {!edge.data!.write && edge.data!.read && (
                <>
                  <IconArrowNarrowLeft />
                  <span className={cls.english}>read</span>
                </>
              )}
              {edge.data!.write && !edge.data!.read && (
                <>
                  <IconArrowNarrowRight />
                  <span className={cls.english}>write</span>
                </>
              )}
            </Button>
          </div>
        </TooltipFull>
      </td>
      {target && <td className={cls.target}>{target.data.name}</td>}
      {!readonly && (
        <td className={cls.action}>
          <Dropdown.Menu>
            <Dropdown.Trigger asChild>
              <Button size="s" display="ghost">
                <IconDotsVertical />
              </Button>
            </Dropdown.Trigger>
            <Dropdown.Content>
              <Dropdown.Item asChild>
                <TooltipFull
                  msg={
                    edge.hidden
                      ? 'Show the connection in the Flow'
                      : 'Hide the connection in the Flow'
                  }
                  side="right"
                >
                  <Button display="item" onClick={onVisibility} size="s">
                    {!edge.hidden ? (
                      <>
                        <IconEyeOff /> Hide
                      </>
                    ) : (
                      <>
                        <IconEye /> Show
                      </>
                    )}
                  </Button>
                </TooltipFull>
              </Dropdown.Item>
              {!edge.data?.source && (
                <Dropdown.Item asChild>
                  <Button danger display="item" onClick={onRemove} size="s">
                    <IconTrash /> Remove
                  </Button>
                </Dropdown.Item>
              )}
            </Dropdown.Content>
          </Dropdown.Menu>
        </td>
      )}
    </tr>
  );
};
