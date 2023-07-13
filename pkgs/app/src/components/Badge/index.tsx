import cls from './index.module.scss';

export const Badge: React.FC<{
  count?: number | undefined;
  showZero?: boolean;
}> = ({ count, showZero = false }) => {
  if (count === 0 && !showZero) {
    return null;
  }
  return <div className={cls.badge}>{count}</div>;
};
