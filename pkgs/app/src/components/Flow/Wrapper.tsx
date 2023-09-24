import classNames from 'classnames';
import type { CSSProperties } from 'react';

import cls from './index.module.scss';

import 'reactflow/dist/style.css';

export const FlowWrapper: React.FC<{
  children: React.ReactNode;
  style?: CSSProperties;
  columnMode?: boolean;
}> = ({ children, style, columnMode }) => {
  return (
    <div
      className={classNames(cls.container, columnMode && cls.columnMode)}
      style={style}
    >
      {children}
    </div>
  );
};
