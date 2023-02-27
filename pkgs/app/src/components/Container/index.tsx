import clsn from 'classnames';

import cls from './index.module.scss';

const OriginContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={clsn(cls.container, className)}>{children}</div>;
};
const Left: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={clsn(cls.left, className)}>{children}</div>;
};
const Right: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={clsn(cls.right, className)}>{children}</div>;
};

export type ContainerProps = typeof OriginContainer & {
  Left: typeof Left;
  Right: typeof Right;
};

export const Container = OriginContainer as ContainerProps;
Container.Left = Left;
Container.Right = Right;
