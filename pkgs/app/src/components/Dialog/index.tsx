import * as DialogPrimitive from '@radix-ui/react-dialog';
import { IconX } from '@tabler/icons-react';
import cn from 'classnames';
import { forwardRef } from 'react';

import cls from './index.module.scss';

const Dialog = DialogPrimitive.Root;
const Trigger = DialogPrimitive.Trigger;
const Close = DialogPrimitive.Close;

const Portal = ({ className, ...props }: DialogPrimitive.DialogPortalProps) => {
  return <DialogPrimitive.Portal className={cn(className)} {...props} />;
};
Portal.displayName = DialogPrimitive.Portal.displayName;

const Overlay = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      className={cn(cls.overlay, className)}
      {...props}
    />
  );
});
Overlay.displayName = DialogPrimitive.Overlay.displayName;

const Content = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  return (
    <Portal>
      <Overlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(cls.content, className)}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className={cls.close}>
          <IconX />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </Portal>
  );
});
Content.displayName = DialogPrimitive.Content.displayName;

const Header = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn(cls.header, className)} {...props} />;
};
Header.displayName = 'DialogHeader';

const Footer = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return <div className={cn(cls.footer, className)} {...props} />;
};
Footer.displayName = 'DialogFooter';

const Title = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Title ref={ref} className={cn(className)} {...props} />
  );
});
Title.displayName = DialogPrimitive.Title.displayName;

const Description = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn(cls.description, className)}
      {...props}
    />
  );
});
Description.displayName = DialogPrimitive.Description.displayName;

export { Dialog, Trigger, Content, Header, Footer, Title, Description, Close };
