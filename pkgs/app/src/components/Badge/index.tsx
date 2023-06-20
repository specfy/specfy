import cls from './index.module.scss';

export const Badge: React.FC<{
  count?: number | undefined;
  showZero?: boolean;
}> = ({ count, showZero = false }) => {
  if (!count && showZero) {
    return null;
  }
  return <div className={cls.badge}>{count}</div>;
};
