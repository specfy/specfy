import { internalTypeToText } from '@specfy/models/src/components/constants';
import classNames from 'classnames';

import type { ComponentType } from '@specfy/models';

import cls from './index.module.scss';

export const ComponentTag: React.FC<{ type: ComponentType }> = ({ type }) => {
  return (
    <div
      className={classNames(
        cls.tag,
        type in cls && cls[type as keyof typeof cls]
      )}
    >
      {internalTypeToText[type]}
    </div>
  );
};
