import { IconSearch } from '@tabler/icons-react';
import cn from 'classnames';
import { Command as CommandPrimitive } from 'cmdk';
import { forwardRef } from 'react';

import * as Dialog from '../Dialog';

import cls from './index.module.scss';

import type { DialogProps } from '@radix-ui/react-dialog';

const Command = forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => {
  return (
    <CommandPrimitive ref={ref} className={cn(cls.cmd, className)} {...props} />
  );
});
Command.displayName = CommandPrimitive.displayName;

type CommandDialogProps = DialogProps;

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog.Dialog {...props}>
      <Dialog.Content className="">
        <Command className="">{children}</Command>
      </Dialog.Content>
    </Dialog.Dialog>
  );
};

const CommandInput = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => {
  return (
    // eslint-disable-next-line react/no-unknown-property
    <div className={cls.inputWrapper} cmdk-input-wrapper="">
      <IconSearch className={cls.icon} />
      <CommandPrimitive.Input
        ref={ref}
        className={cn(cls.input, className)}
        {...props}
      />
    </div>
  );
});

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => {
  return (
    <CommandPrimitive.List ref={ref} className={cn(className)} {...props} />
  );
});

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => {
  return <CommandPrimitive.Empty ref={ref} className={cls.empty} {...props} />;
});

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => {
  return (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(cls.group, className)}
      {...props}
    />
  );
});

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => {
  return (
    <CommandPrimitive.Separator
      ref={ref}
      className={cn(cls.separator, className)}
      {...props}
    />
  );
});
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(cls.item, className)}
      {...props}
    />
  );
});

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn(className)} {...props} />;
};
CommandShortcut.displayName = 'CommandShortcut';

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
