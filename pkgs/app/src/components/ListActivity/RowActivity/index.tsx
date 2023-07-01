import type { ApiActivityGrouped, ApiMe } from '@specfy/api/src/types/api';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import type { ActivityContext } from '../../../common/activity';
import { mapActivites } from '../../../common/activity';
import { AvatarAuto } from '../../AvatarAuto';
import { Time } from '../../Time';

import cls from './index.module.scss';

export const RowActivity: React.FC<{
  me: ApiMe['id'];
  act: ApiActivityGrouped;
  isChild?: boolean;
  ctx: ActivityContext;
}> = ({ me, act, ctx, isChild }) => {
  const user = isChild ? (
    'and'
  ) : (
    <Link to={`/_/user/${act.user.id}`} className={cls.username}>
      {act.user.name}
    </Link>
  );

  const { Text, Card, Target, icon } = mapActivites[act.action];

  return (
    <div
      className={classNames(cls.row, isChild && cls.isChild)}
      data-action={act.action}
    >
      <div className={cls.main}>
        {!isChild ? (
          <Link to={`/_/user/${act.user.id}`} className={cls.avatar}>
            <AvatarAuto
              name={act.user.name}
              src={act.user.avatarUrl}
              single={true}
              size="small"
              colored={false}
              icon={icon}
            />
          </Link>
        ) : (
          <div className={cls.dot}></div>
        )}
        <div className={cls.desc}>
          <span>
            <Text
              act={act}
              ctx={ctx}
              user={user}
              target={<Target act={act} />}
            />
          </span>
        </div>
        <div className={cls.date}>
          {!isChild && <Time time={act.createdAt} />}
        </div>
      </div>
      {act.childrens && (
        <div>
          {act.childrens.map((child) => {
            return (
              <RowActivity
                key={child.id}
                act={child}
                me={me}
                ctx={ctx}
                isChild={true}
              />
            );
          })}
        </div>
      )}
      {Card && <Card act={act} ctx={ctx} />}
    </div>
  );
};
