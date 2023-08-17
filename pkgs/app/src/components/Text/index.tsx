import classNames from 'classnames';

import cls from './index.module.scss';

export const Subdued: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <span className={classNames(cls.subdued, className)}>{children}</span>;
};
