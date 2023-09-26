import { Slot } from '@radix-ui/react-slot';
import cn from 'classnames';
import { forwardRef } from 'react';

import { Loading } from '@/components/Loading';

import cls from './index.module.scss';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  size?: 'xl' | 'l' | 'm' | 's';
  display?: 'default' | 'ghost' | 'item' | 'primary';
  danger?: boolean;
  loading?: boolean;
  block?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      asChild = false,
      size = 'm',
      display = 'default',
      danger,
      loading,
      block,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          cls.btn,
          cls[display],
          cls[size],
          danger && cls.danger,
          block && cls.block,
          loading && cls.loading,
          className
        )}
        ref={ref}
        {...props}
        disabled={props.disabled || loading === true}
      >
        {loading && <Loading className={cls.loader} />}
        {props.children}
      </Comp>
    );
  }
);
Button.displayName = 'Button';

export { Button };
