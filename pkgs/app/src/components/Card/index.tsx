import classnames from 'classnames';

import cls from './index.module.scss';

const OriginCard: React.FC<{
  children: React.ReactNode;
  padded?: boolean;
  seamless?: boolean;
  transparent?: boolean;
  large?: boolean;
  auto?: boolean;
}> = ({ children, padded, seamless, transparent, large, auto }) => {
  return (
    <div
      className={classnames(
        cls.card,
        padded && cls.padded,
        seamless && cls.seamless,
        transparent && cls.transparent,
        large && cls.large,
        auto && cls.auto
      )}
    >
      {children}
    </div>
  );
};

const Actions: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <div className={classnames(cls.actions)}>{children}</div>;
};

const Content: React.FC<{
  children: React.ReactNode;
  className?: string;
  large?: boolean;
}> = ({ children, className, large }) => {
  return (
    <div className={classnames(cls.content, className, large && cls.large)}>
      {children}
    </div>
  );
};

export type CardProps = typeof OriginCard & {
  Actions: typeof Actions;
  Content: typeof Content;
};

export const Card = OriginCard as CardProps;
Card.Actions = Actions;
Card.Content = Content;
