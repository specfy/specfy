import { internalTypeToText } from '@specfy/models/src/components/constants';
import { IconLinkOff } from '@tabler/icons-react';
import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { ApiProjectList, ComponentType } from '@specfy/models';

import { useProjectStore } from '@/common/store';
import { supportedArray } from '@/common/techs';
import type { TechInfo } from '@/common/techs';
import { AvatarAuto } from '@/components/AvatarAuto';
import { ComponentIcon } from '@/components/Component/Icon';
import { Button } from '@/components/Form/Button';
import type { OptionValue, OptionGroup } from '@/components/Form/MultiSelect';
import { TooltipFull } from '@/components/Tooltip';

import cls from './index.module.scss';

import type { ChangeEventHandler } from 'react';

export type TechSearchItem =
  | {
      type: 'project';
      project: ApiProjectList;
    }
  | {
      type: 'tech';
      tech: TechInfo;
    }
  | { type: 'create'; label: string };

export const TechSearch: React.FC<{
  selected?: string | null;
  onPick: (tech: TechSearchItem | null) => void;
}> = ({ selected, onPick }) => {
  const storeProject = useProjectStore();
  const [search, setSearch] = useState('');
  const [focus, setFocus] = useState<number>(0);
  const [currGroup, setCurrGroup] = useState<string>();
  const refList = useRef<HTMLDivElement>(null);

  const groups = useMemo<Array<OptionGroup<TechSearchItem>>>(() => {
    const _groups: Record<ComponentType, Array<OptionValue<TechSearchItem>>> = {
      analytics: [],
      api: [],
      app: [],
      ci: [],
      cloud: [],
      db: [],
      etl: [],
      hosting: [],
      language: [],
      messaging: [],
      monitoring: [],
      network: [],
      project: [],
      saas: [],
      service: [],
      storage: [],
      tool: [],
    };

    for (const tech of supportedArray) {
      if (tech.type === 'language' || tech.type === 'tool') {
        continue;
      }
      _groups[tech.type].push({
        label: tech.name,
        value: tech.key,
        data: {
          type: 'tech',
          tech,
        },
      });
    }

    for (const project of storeProject.projects) {
      _groups.project.push({
        label: project.name,
        value: project.id,
        data: {
          type: 'project',
          project,
        },
      });
    }

    return Object.entries(_groups).map(([key, items]) => {
      return { label: key, options: items };
    });
  }, [selected]);

  const filtered = useMemo<OptionGroup[]>(() => {
    const reg = new RegExp(`${search}`, 'i');
    const copy = groups
      .map(({ label, options }) => {
        if (reg.test(label)) {
          return { label, options };
        }
        return {
          label,
          options: options.filter((item) => {
            return (
              reg.test(item.label) ||
              reg.test(item.value) ||
              reg.test(item.data!.type)
            );
          }),
        };
      })
      .filter((entry) => {
        return entry.options.length > 0;
      });
    copy.push({
      label: 'Other',
      options: [
        {
          label: `Create "${search}"`,
          value: search,
          data: { type: 'create', label: search },
        },
      ],
    });
    return copy;
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
      onPick(filtered[index].options[focus].data);
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
          if (group.options.length <= 0) {
            return null;
          }

          return (
            <div key={group.label} className={cls.group}>
              <div className={cls.name}>
                {internalTypeToText[group.label as ComponentType]}
              </div>
              <div className={cls.rows} role="list">
                {group.options.map((item, i) => {
                  if (item.data.type === 'project') {
                    return (
                      <div
                        key={item.label}
                        className={classNames(
                          cls.row,
                          selected === item.value && cls.selected,
                          currGroup === group.label &&
                            focus === i &&
                            cls.focused
                        )}
                        role="listitem"
                        onClick={() => onPick(item.data)}
                      >
                        <AvatarAuto name={item.label} size="s" shape="square" />
                        {item.label}
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.value}
                      className={classNames(
                        cls.row,
                        selected === item.value && cls.selected,
                        currGroup === group.label && focus === i && cls.focused
                      )}
                      role="listitem"
                      onClick={() => onPick(item.data)}
                    >
                      <ComponentIcon
                        data={{
                          name: item.label,
                          techId: item.value,
                          type: item.data.type,
                        }}
                        noEmpty
                        large
                        className={cls.icon}
                      />
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {!filtered.find((group) => group.options.length > 0) && (
          <div className={cls.empty}>
            No results for &quot;{search}&quot;
            <div>
              Missing something?{' '}
              <a
                href="https://github.com/specfy/stack-analyser/issues/new?assignees=bodinsamuel&labels=tech+request&projects=&template=technology-request.md&title=%5BTECH%5D+Add+__NAME__"
                target="_blank"
                rel="noreferrer"
              >
                Submit a request
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
