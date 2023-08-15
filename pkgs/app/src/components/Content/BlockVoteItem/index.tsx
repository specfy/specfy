import type { BlockVoteItem } from '@specfy/models';
import { IconHeartFilled, IconThumbDown } from '@tabler/icons-react';
import classnames from 'classnames';
import { useState } from 'react';

import type { Payload } from '../../../common/content';
import { map } from '../../../common/content';
import { AvatarAuto, AvatarGroup } from '../../AvatarAuto';

import cls from './index.module.scss';

export const ContentBlockVoteItem: React.FC<{
  block: BlockVoteItem;
  pl: Payload;
}> = ({ block, pl }) => {
  const accepted = block.attrs.choiceId === '1';
  const [open, setOpen] = useState(accepted);

  return (
    <div
      className={classnames(cls.item, accepted ? cls.accepted : cls.rejected)}
    >
      <div
        className={cls.header}
        onClick={() => setOpen(!open)}
        tabIndex={0}
        role="group"
      >
        <div className={cls.label}>
          {accepted && (
            <div className={cls.result}>
              <IconHeartFilled />
              Accepted
            </div>
          )}
          {!accepted && (
            <div className={cls.result}>
              <IconThumbDown />
              Rejected
            </div>
          )}
          Choice {block.attrs.choiceId}
        </div>
        <div>
          <AvatarGroup>
            {['Samuel Bodin', 'Raphael Da', 'Nico Tore'].map((name) => {
              return <AvatarAuto key={name} name={name} />;
            })}
          </AvatarGroup>
        </div>
      </div>
      <div className={classnames(cls.content, !open && cls.close)}>
        {map(block, pl)}
      </div>
    </div>
  );
};
