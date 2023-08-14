import type { NodeData } from '@specfy/models';
import { IconCode, IconSquare } from '@tabler/icons-react';
import classNames from 'classnames';

import { supportedIndexed } from '../../../common/techs';
import { AvatarAuto } from '../../AvatarAuto';

import cls from './index.module.scss';

export const ComponentIcon: React.FC<{
  data: Partial<Pick<NodeData, 'name' | 'techId' | 'type'>>;
  large?: boolean;
  noEmpty?: boolean;
}> = ({ data, large, noEmpty }) => {
  if (data.type === 'project') {
    return (
      <div className={classNames(cls.icon, cls.project, large && cls.large)}>
        <AvatarAuto
          name={data.name || ''}
          size={large ? 'default' : 'small'}
          shape="square"
        />
      </div>
    );
  }

  const Icon =
    data.techId &&
    data.techId in supportedIndexed &&
    supportedIndexed[data.techId].Icon;
  if (Icon) {
    return (
      <div className={classNames(cls.icon, large && cls.large)}>
        <Icon size="1em" />
      </div>
    );
  }
  if (data.type === 'service') {
    return (
      <div className={classNames(cls.icon, cls.service, large && cls.large)}>
        <IconCode size="1em" />
      </div>
    );
  }
  return (
    <div className={classNames(cls.icon, large && cls.large)}>
      {noEmpty && <IconSquare size="1em" />}
    </div>
  );
};
