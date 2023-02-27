import classnames from 'classnames';

import cls from './index.module.scss';

const OriginCard: React.FC<{ children: React.ReactNode; padded?: boolean }> = ({
  children,
  padded,
}) => {
  return (
    <div className={classnames(cls.card, padded && cls.padded)}>{children}</div>
  );
};

const Actions: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className={cls.actions}>{children}</div>;
};

const Content: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className={cls.content}>{children}</div>;
};

export type CardProps = typeof OriginCard & {
  Actions: typeof Actions;
  Content: typeof Content;
};

export const Card = OriginCard as CardProps;
Card.Actions = Actions;
Card.Content = Content;
