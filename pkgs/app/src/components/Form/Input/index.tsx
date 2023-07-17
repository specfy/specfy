import classNames from 'classnames';
import { forwardRef } from 'react';

import cls from './index.module.scss';

export const Input = forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    size?: 'l' | 'm' | 's' | 'xl';
    before?: React.ReactNode;
  }
>(function Input({ before, size = 'm', ...props }, ref) {
  return (
    <div
      className={classNames(
        cls.wrapper,
        cls[size],
        props.disabled && cls.disabled,
        props.className
      )}
    >
      {before && <div className={cls.before}>{before}</div>}
      <input {...props} className={classNames(cls.input)} ref={ref} />
    </div>
  );
});
