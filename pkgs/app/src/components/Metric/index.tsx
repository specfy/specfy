import classNames from 'classnames';

import cls from './index.module.scss';

export const Metric: React.FC<{
  number: number;
  label: React.ReactNode;
  unit?: string;
  labelPos?: 'right' | 'down';
  className?: string;
}> = ({ number, label, unit, className, labelPos = 'right' }) => {
  return (
    <div
      className={classNames(
        cls.metric,
        labelPos === 'down' && cls.column,
        className
      )}
    >
      <div className={cls.number}>
        {number}
        {unit}
      </div>
      <div className={cls.label}>{label}</div>
    </div>
  );
};
