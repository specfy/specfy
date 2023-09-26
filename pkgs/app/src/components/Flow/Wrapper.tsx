import classNames from 'classnames';
import 'reactflow/dist/style.css';

import cls from './index.module.scss';

import type { CSSProperties } from 'react';

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
