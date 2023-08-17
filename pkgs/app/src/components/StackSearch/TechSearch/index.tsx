import type { ComponentType } from '@specfy/models';
import { IconLinkOff } from '@tabler/icons-react';
import classNames from 'classnames';
import type { ChangeEventHandler } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useProjectStore } from '../../../common/store';
import type { TechInfo } from '../../../common/techs';
import { internalTypeToText, supportedArray } from '../../../common/techs';
import { AvatarAuto } from '../../AvatarAuto';
import { ComponentIcon } from '../../Component/Icon';
import { Button } from '../../Form/Button';
import { TooltipFull } from '../../Tooltip';

import cls from './index.module.scss';

export type TechSearchItem = { selected?: boolean } & (
  | TechInfo
  | { type: 'project'; key: string; name: string }
);

export const TechSearch: React.FC<{
  selected?: string | null;
  onPick: (tech: TechSearchItem | null) => void;
}> = ({ selected, onPick }) => {
  const storeProject = useProjectStore();
  const [search, setSearch] = useState('');
  const [focus, setFocus] = useState<number>(0);
  const [currGroup, setCurrGroup] = useState<ComponentType>();
  const refList = useRef<HTMLDivElement>(null);

  const groups: Array<{ key: ComponentType; items: TechSearchItem[] }> =
    useMemo(() => {
      const _groups: Record<ComponentType, TechSearchItem[]> = {
        api: [],
        app: [],
        ci: [],
        db: [],
        etl: [],
        hosting: [],
        language: [],
        messaging: [],
        network: [],
        project: [],
        saas: [],
        service: [],
        storage: [],
        tool: [],
      };

      for (const tech of supportedArray) {
        if (tech.key === selected) {
          _groups[tech.type].push({
            ...tech,
            selected: true,
          });
        } else {
          _groups[tech.type].push(tech);
        }
      }

      for (const proj of storeProject.projects) {
        _groups.project.push({
          type: 'project',
          key: proj.id,
          name: proj.name,
          selected: proj.id === selected,
        });
      }

      return Object.entries(_groups).map(([key, items]) => {
        return { key: key as ComponentType, items };
      });
    }, [selected]);

  const filtered: Array<{ key: ComponentType; items: TechSearchItem[] }> =
    useMemo(() => {
      const reg = new RegExp(`${search}`, 'i');
      return groups
        .map(({ key, items }) => {
          return {
            key,
            items: items.filter((item) => {
              return (
                reg.test(item.name) || reg.test(item.key) || reg.test(item.type)
              );
            }),
          };
        })
        .filter((entry) => {
          return entry.items.length > 0;
        });
    }, [search]);

  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearch(e.target.value);
    setCurrGroup(undefined);
    setFocus(0);
  };

  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.code === 'ArrowDown') {
      e.preventDefault();
      if (!currGroup) {
        if (filtered.length > 0) {
          setCurrGroup(filtered[0].key);
          setFocus(0);
        }
        return;
      }

      const index = filtered.findIndex((f) => f.key === currGroup);
      const tmp = filtered[index];
      if (focus < tmp.items.length - 1) {
        // Still in the same group
        setFocus(focus + 1);
        return;
      }

      if (index === filtered.length - 1) {
        // Reset
        setCurrGroup(filtered[0].key);
        setFocus(0);
      } else {
        // Next group
        setCurrGroup(filtered[index + 1].key);
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

      const index = filtered.findIndex((f) => f.key === currGroup);
      if (index === 0) {
        return;
      }

      // Next group
      setCurrGroup(filtered[index - 1].key);
      setFocus(filtered[index - 1].items.length - 1);
      return;
    }

    if (e.code === 'Enter') {
      if (!currGroup) {
        return;
      }

      const index = filtered.findIndex((f) => f.key === currGroup);
      onPick(filtered[index].items[focus]);
    }
  };

  useEffect(() => {
    const focused = refList.current?.getElementsByClassName(cls.focused);
    if (focused && focused.length > 0) {
      focused[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [focus]);

  return (
    <div className={cls.main}>
      <div className={cls.inputGroup}>
        <input
          className={cls.input}
          value={search}
          onChange={onChange}
          placeholder="Search..."
          onKeyDown={handleKeyPress}
        />
        {selected && (
          <div className={cls.actions}>
            <TooltipFull msg={'Make it a service'} side="top">
              <Button display="ghost" onClick={() => onPick(null)}>
                <IconLinkOff />
              </Button>
            </TooltipFull>
          </div>
        )}
      </div>

      <div className={cls.groups} ref={refList}>
        {filtered.map((group) => {
          if (group.items.length <= 0) {
            return null;
          }
          return (
            <div key={group.key} className={cls.group}>
              <div className={cls.name}>{internalTypeToText[group.key]}</div>
              <div className={cls.rows} role="list">
                {group.items.map((item, i) => {
                  if (item.type === 'project') {
                    return (
                      <div
                        key={item.key}
                        className={classNames(
                          cls.row,
                          item.selected && cls.selected,
                          currGroup === group.key && focus === i && cls.focused
                        )}
                        role="listitem"
                        onClick={() => onPick(item)}
                      >
                        <AvatarAuto name={item.name} size="s" shape="square" />
                        {item.name}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.key}
                      className={classNames(
                        cls.row,
                        item.selected && cls.selected,
                        currGroup === group.key && focus === i && cls.focused
                      )}
                      role="listitem"
                      onClick={() => onPick(item)}
                    >
                      <ComponentIcon
                        data={{
                          name: item.name,
                          techId: item.key,
                          type: item.type,
                        }}
                        noEmpty
                        large
                        className={cls.icon}
                      />
                      {item.name}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
