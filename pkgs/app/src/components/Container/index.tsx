import classnames from 'classnames';

import cls from './index.module.scss';

const OriginContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}> = ({ children, className, noPadding }) => {
  return (
    <div
      className={classnames(
        cls.container,
        noPadding && cls.noPadding,
        className
      )}
    >
      {children}
    </div>
  );
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
const Left2Third: React.FC<{
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}> = ({ children, className, padded }) => {
  return (
    <div
      className={classnames(cls.left2third, className, padded && cls.padded)}
    >
      {children}
    </div>
  );
};
const Right1Third: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <div className={classnames(cls.right1third, className)}>{children}</div>
  );
};

export type ContainerProps = typeof OriginContainer & {
  Left: typeof Left;
  Right: typeof Right;
  Center: typeof Center;
  Left2Third: typeof Left2Third;
  Right1Third: typeof Right1Third;
};

export const Container = OriginContainer as ContainerProps;
Container.Left = Left;
Container.Right = Right;
Container.Center = Center;
Container.Left2Third = Left2Third;
Container.Right1Third = Right1Third;
