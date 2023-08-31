import type { NodeData } from '@specfy/models';
import { IconBox, IconCode } from '@tabler/icons-react';
import classNames from 'classnames';

import { AvatarAuto } from '../../AvatarAuto';

import cls from './index.module.scss';

import { supportedIndexed } from '@/common/techs';

export const ComponentIcon: React.FC<{
  data: Partial<Pick<NodeData, 'name' | 'techId' | 'type'>>;
  large?: boolean;
  noEmpty?: boolean;
  className?: string;
}> = ({ data, large, noEmpty, className }) => {
  if (data.type === 'project') {
    return (
      <div
        className={classNames(
          cls.icon,
          cls.project,
          large && cls.large,
          className
        )}
      >
        <AvatarAuto
          name={data.name || ''}
          size={large ? 'd' : 's'}
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
      <div
        className={classNames(
          cls.icon,
          cls.component,
          large && cls.large,
          className
        )}
      >
        <Icon size="1em" />
      </div>
    );
  }
  if (data.type === 'service') {
    return (
      <div
        className={classNames(
          cls.icon,
          cls.service,
          large && cls.large,
          className
        )}
      >
        <IconCode size="1em" />
      </div>
    );
  }
  return (
    <div
      className={classNames(
        cls.icon,
        cls.placeholder,
        large && cls.large,
        className
      )}
    >
      {noEmpty && <IconBox size="1em" />}
    </div>
  );
};
