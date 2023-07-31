import { Slot } from '@radix-ui/react-slot';
import cn from 'classnames';
import { forwardRef } from 'react';

import cls from './index.module.scss';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  display?: 'default' | 'primary';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, display = 'default', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(cls.btn, cls[display], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
