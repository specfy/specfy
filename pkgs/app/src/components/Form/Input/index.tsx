import classNames from 'classnames';
import { forwardRef } from 'react';

import cls from './index.module.scss';

export type InputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'size'
> & {
  size?: 'l' | 'm' | 's' | 'xl';
  before?: React.ReactNode;
  after?: React.ReactNode;
  seamless?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { before, after, size = 'm', style, ...props },
  ref
) {
  return (
    <div
      className={classNames(
        cls.wrapper,
        cls[size],
        props.seamless && cls.seamless,
        props.disabled && cls.disabled,
        props.readOnly && cls.readonly,
        props.className
      )}
      style={style}
    >
      {before && <div className={cls.before}>{before}</div>}
      <input {...props} className={classNames(cls.input)} ref={ref} />
      {after && <div className={cls.after}>{after}</div>}
    </div>
  );
});
