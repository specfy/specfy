import type { NodeData } from '@specfy/api/src/common/flow/types';
import { IconCode } from '@tabler/icons-react';
import classNames from 'classnames';

import { supportedIndexed } from '../../../common/component';
import { AvatarAuto } from '../../AvatarAuto';

import cls from './index.module.scss';

export const ComponentIcon: React.FC<
  Partial<Pick<NodeData, 'label' | 'techId' | 'type'>> & { large?: boolean }
> = ({ label, techId, type, large }) => {
  if (type === 'project') {
    return (
      <div className={classNames(cls.icon, cls.project, large && cls.large)}>
        <AvatarAuto name={label || ''} size="small" shape="square" />
      </div>
    );
  }

  const Icon =
    techId && techId in supportedIndexed && supportedIndexed[techId].Icon;
  if (Icon) {
    return (
      <div className={classNames(cls.icon, large && cls.large)}>
        <Icon size="1em" />
      </div>
    );
  }
  if (type === 'component') {
    return (
      <div className={classNames(cls.icon, cls.service, large && cls.large)}>
        <IconCode size="1em" />
      </div>
    );
  }

  return null;
};
