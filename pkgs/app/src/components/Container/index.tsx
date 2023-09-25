import classnames from 'classnames';

import cls from './index.module.scss';

export const Container: React.FC<{
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

export const ContainerChild: React.FC<{
  children: React.ReactNode;
  className?: string;
  left?: boolean;
  right?: boolean;
  fullCenter?: boolean;
  centered?: boolean;
  leftLarge?: boolean;
  rightSmall?: boolean;
  padded?: boolean;
}> = ({
  children,
  className,
  left,
  right,
  fullCenter,
  centered,
  leftLarge,
  rightSmall,
  padded,
}) => {
  return (
    <div
      className={classnames(
        left && cls.left,
        right && cls.right,
        fullCenter && cls.center,
        centered && cls.centered,
        leftLarge && cls.leftLarge,
        rightSmall && cls.rightSmall,
        padded && cls.padded,
        className
      )}
    >
      {children}
    </div>
  );
};
