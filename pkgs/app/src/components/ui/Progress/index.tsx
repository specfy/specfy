import * as ProgressPrimitive from '@radix-ui/react-progress';
import classNames from 'classnames';
import { forwardRef } from 'react';

import cls from './index.module.scss';

const Progress = forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={classNames(cls.root, className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cls.progress}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
