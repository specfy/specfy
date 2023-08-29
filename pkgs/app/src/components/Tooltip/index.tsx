import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import cn from 'classnames';
import { forwardRef } from 'react';

import cls from './index.module.scss';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

type Props = {
  size?: 's';
};

const TooltipContent = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content> & Props,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & Props
>(({ className, sideOffset = 4, size, ...props }, ref) => {
  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(cls.content, size && cls[size], className)}
      {...props}
    />
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const TooltipFull: React.FC<
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> & {
    children: React.ReactNode;
    msg: boolean | string;
  } & Props
> = ({ children, msg, ...props }) => {
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipPrimitive.TooltipPortal>
        {msg && (
          <TooltipContent sideOffset={5} {...props}>
            <p>{msg}</p>
            {/* <TooltipPrimitive.TooltipArrow /> */}
          </TooltipContent>
        )}
      </TooltipPrimitive.TooltipPortal>
    </Tooltip>
  );
};
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipFull,
};
