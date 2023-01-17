import clsn from 'classnames';

import cls from './index.module.scss';

export const Container: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={clsn(cls.container, className)}>{children}</div>;
};
