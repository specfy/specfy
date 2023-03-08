import classnames from 'classnames';

import cls from './index.module.scss';

const OriginContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={classnames(cls.container, className)}>{children}</div>;
};
const Left: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={classnames(cls.left, className)}>{children}</div>;
};
const Right: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={classnames(cls.right, className)}>{children}</div>;
};
const Center: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return <div className={classnames(cls.center, className)}>{children}</div>;
};

export type ContainerProps = typeof OriginContainer & {
  Left: typeof Left;
  Right: typeof Right;
  Center: typeof Center;
};

export const Container = OriginContainer as ContainerProps;
Container.Left = Left;
Container.Right = Right;
Container.Center = Center;
