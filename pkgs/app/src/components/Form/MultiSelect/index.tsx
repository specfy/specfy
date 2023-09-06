import * as Popover from '@radix-ui/react-popover';
import { IconCheck, IconX } from '@tabler/icons-react';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Command, CommandGroup, CommandItem, CommandList } from '../../Command';
import { Tag } from '../../Tag';
import { Input } from '../Input';

import cls from './index.module.scss';

export type OptionGroup = {
  label: string;
  options: OptionValue[];
};
export type OptionValue<TData extends Record<string, any> = any> = {
  label: string;
  value: string;
  data?: TData;
};

type Option = OptionGroup | OptionValue;

function flatten(options: Option[], list: OptionValue[]) {
  for (const option of options) {
    if ('options' in option) {
      flatten(option.options, list);
    } else {
      list.push(option);
    }
  }
}

export const MultiSelect: React.FC<{
  autoFocus?: boolean;
  allowClear?: boolean;
  options: OptionGroup[];
  values: string[];
  multiple?: boolean;
  onChange: (values: string[]) => void;
  onCreate: (option: OptionValue) => void;
}> = ({
  autoFocus,
  options,
  values,
  allowClear = false,
  multiple,
  onChange,
  onCreate,
}) => {
  const refList = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focus, setFocus] = useState<number>(0);
  const [currGroup, setCurrGroup] = useState<string>();

  const rawOptions = useMemo(() => {
    const raw: OptionValue[] = [];
    flatten(options, raw);
    return raw;
  }, [options]);

  // Options filtered after search
  const filtered: OptionGroup[] = useMemo(() => {
    if (!search || search === '') {
      return options;
    }

    const reg = new RegExp(`${search}`, 'i');
    const copy: OptionGroup[] = options
      .map((opt) => {
        return {
          label: opt.label,
          options: opt.options.filter((item) => {
            return reg.test(item.value) || reg.test(item.label);
          }),
        };
      })
      .filter((opt) => {
        if (opt && 'options' in opt) {
          return opt.options.length > 0;
        }
        return opt !== null;
      });
    copy.push({
      label: 'Other',
      options: [
        {
          label: `Create "${search}"`,
          value: search,
          data: { create: true },
        },
      ],
    });

    return copy;
  }, [search]);

  const handleSelect = useCallback(
    (value: string) => {
      if (values.includes(value)) {
        onChange(values.filter((v) => v !== value));
        setSearch('');
      } else {
        if (multiple) {
          onChange([...values, value]);
        } else {
          onChange([value]);
        }
      }
      setSearch('');
    },
    [values, multiple]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const input = inputRef.current;
      if (!input) {
        return;
      }

      // Backspace to delete previous
      // Not executed well enough, it should highlight first then delete
      // if (e.key === 'Delete' || e.key === 'Backspace') {
      //   if (input.value === '') {
      //     setSelected((prev) => {
      //       const newSelected = [...prev];
      //       newSelected.pop();
      //       return newSelected;
      //     });
      //   }
      //   return;
      // }

      // This is not a default behavior of the <input /> field
      if (e.key === 'Escape') {
        input.blur();
        return;
      }

      if (e.code === 'ArrowDown') {
        setOpen(true);
        e.preventDefault();
        if (!currGroup) {
          if (filtered.length > 0) {
            setCurrGroup(filtered[0].label);
            setFocus(0);
          }
          return;
        }

        const index = filtered.findIndex((f) => f.label === currGroup);
        const tmp = filtered[index];
        if (focus < tmp.options.length - 1) {
          // Still in the same group
          setFocus(focus + 1);
          return;
        }

        if (index === filtered.length - 1) {
          // Reset
          setCurrGroup(filtered[0].label);
          setFocus(0);
        } else {
          // Next group
          setCurrGroup(filtered[index + 1].label);
          setFocus(0);
        }
        return;
      }

      if (e.code === 'ArrowUp') {
        e.preventDefault();
        if (!currGroup) {
          return;
        }
        if (focus > 0) {
          setFocus(focus - 1);
          return;
        }

        const index = filtered.findIndex((f) => f.label === currGroup);
        if (index === 0) {
          return;
        }

        // Next group
        setCurrGroup(filtered[index - 1].label);
        setFocus(filtered[index - 1].options.length - 1);
        return;
      }

      if (e.code === 'Enter') {
        if (!currGroup) {
          return;
        }

        const index = filtered.findIndex((f) => f.label === currGroup);
        handleSelect(filtered[index].options[focus].value);
      }
    },
    [filtered, currGroup, focus]
  );

  // Scroll when focus changes
  useEffect(() => {
    const focused = refList.current?.getElementsByClassName(cls.focused);
    if (focused && focused.length > 0) {
      focused[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focus]);

  // React to input change
  const onSearch: React.ChangeEventHandler<HTMLInputElement> = (el) => {
    setSearch(el.target.value);
    setOpen(true);
    setCurrGroup(undefined);
    setFocus(0);
  };

  // Compute list of tags from values
  const tags = useMemo<OptionValue[]>(() => {
    const found = rawOptions.filter((opt) => values.includes(opt.value));
    const created: OptionValue[] = [];
    for (const val of values) {
      const find = found.find((v) => v.value === val);
      if (find) {
        created.push(find);
        continue;
      }

      created.push({ label: val, value: val });
    }

    return created;
  }, [values]);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger>
        <div>
          <div className={cls.inputs}>
            {tags.map((sel) => {
              return (
                <Tag
                  key={sel.value}
                  closable
                  onClose={() => handleSelect(sel.value)}
                  variant="light"
                >
                  {sel.label}
                </Tag>
              );
            })}

            <Input
              ref={inputRef}
              value={search}
              size="s"
              onChange={onSearch}
              onBlur={() => {
                setOpen(true);
                inputRef.current?.focus();
              }}
              onFocus={() => {
                setOpen(true);
                inputRef.current?.focus();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              autoFocus={autoFocus}
              seamless
              className={cls.input}
              after={
                allowClear && (
                  <button onClick={() => onChange([])}>
                    <IconX />
                  </button>
                )
              }
            />
          </div>
        </div>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content className={cls.content} align="start" sideOffset={4}>
          <Command className={cls.cmd}>
            <CommandList ref={refList}>
              {filtered.map((group) => {
                return (
                  <CommandGroup
                    key={group.label}
                    className={cls.group}
                    heading={group.label}
                  >
                    {group.options.map((opt, i) => {
                      const isSelected = values.includes(opt.value);

                      return (
                        <CommandItem
                          key={opt.value}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onSelect={() => {
                            if (opt.data?.create) {
                              onCreate(opt);
                              setSearch('');
                              return;
                            }
                            handleSelect(opt.value);
                          }}
                          className={classNames(
                            cls.row,
                            isSelected && cls.selected,
                            currGroup === group.label &&
                              focus === i &&
                              cls.focused
                          )}
                          aria-selected={isSelected}
                        >
                          {isSelected && <IconCheck />}
                          {opt.label}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })}
              {/* {search && (
                <CommandItem
                  className={classNames(cls.row)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onSelect={() => {
                    handleSelect(search);
                  }}
                >
                  <IconPlus /> Create &quot;{search}&quot;
                </CommandItem>
              )} */}
            </CommandList>
          </Command>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
