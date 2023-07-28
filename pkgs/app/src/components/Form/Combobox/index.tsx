import {
  Popover,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { IconCheck, IconSelector } from '@tabler/icons-react';
import cn from 'classnames';
import { useMemo, useState } from 'react';

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandSeparator,
} from '../../Command';
import { Flex } from '../../Flex';
import { Button } from '../Button';

import cls from './index.module.scss';

export interface ComboboxOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export const Combobox: React.FC<{
  options: ComboboxOption[];
  value: string | undefined;
  placeholder: string;
  className?: string;
  after?: React.ReactNode;
  disabled?: boolean;
  onChange: (value: string) => void;
}> = ({
  options,
  value,
  placeholder,
  className,
  after,
  disabled,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const item = useMemo(() => {
    if (!value) {
      return;
    }
    return options.find((o) => o.value === value);
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          role="combobox"
          aria-expanded={open}
          className={className}
          disabled={disabled}
        >
          {item && (
            <Flex gap="l">
              {item.icon}
              {item.label}
            </Flex>
          )}
          {!item && placeholder}
          <IconSelector className={cls.icon} />
        </Button>
      </PopoverTrigger>
      <PopoverPortal>
        <PopoverContent style={{ width: '100%' }} align="start" sideOffset={4}>
          <Command>
            <CommandInput placeholder="Search..." />
            <CommandEmpty>No result.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  onSelect={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  {opt.icon && opt.icon}
                  {opt.label}
                  {opt.value === value && (
                    <IconCheck className={cn(cls.icon)} />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {after && (
              <>
                <CommandSeparator />
                <CommandGroup>{after}</CommandGroup>
              </>
            )}
          </Command>
        </PopoverContent>
      </PopoverPortal>
    </Popover>
  );
};
