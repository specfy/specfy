import cls from './index.module.scss';

export const Subdued: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <span className={cls.subdued}>{children}</span>;
};
