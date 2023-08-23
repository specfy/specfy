import * as PopoverPrimitive from '@radix-ui/react-popover';
import classNames from 'classnames';
import { forwardRef } from 'react';

import cls from './index.module.scss';

const Popover = PopoverPrimitive.Root;

const Trigger = PopoverPrimitive.Trigger;

const Content = forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={classNames(cls.content, className)}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
});
Content.displayName = PopoverPrimitive.Content.displayName;

export { Popover, Trigger, Content };
