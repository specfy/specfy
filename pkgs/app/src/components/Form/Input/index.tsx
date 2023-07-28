import classNames from 'classnames';
import { forwardRef } from 'react';

import cls from './index.module.scss';

export const Input = forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & {
    size?: 'l' | 'm' | 's' | 'xl';
    before?: React.ReactNode;
    after?: React.ReactNode;
    seamless?: boolean;
  }
>(function Input({ before, after, size = 'm', ...props }, ref) {
  return (
    <div
      className={classNames(
        cls.wrapper,
        cls[size],
        props.seamless && cls.seamless,
        props.disabled && cls.disabled,
        props.className
      )}
    >
      {before && <div className={cls.before}>{before}</div>}
      <input {...props} className={classNames(cls.input)} ref={ref} />
      {after && <div className={cls.after}>{after}</div>}
    </div>
  );
});
