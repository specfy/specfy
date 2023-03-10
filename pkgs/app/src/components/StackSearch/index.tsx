import { IconCheck, IconPlus } from '@tabler/icons-react';
import type { InputRef } from 'antd';
import { Select, Button, Input } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import type { ApiComponent, ApiProject } from 'api/src/types/api';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMount } from 'react-use';

import type { TechInfo } from '../../common/component';
import { supportedArray } from '../../common/component';

import cls from './index.module.scss';

type SearchResult<T = ApiComponent | ApiProject | TechInfo> = {
  type: T;
  used: boolean;
  category?: string;
};

export const StackSearch: React.FC<{
  comps: ApiComponent[];
  searchStack: Array<TechInfo['type']>;
  searchProject: boolean;
  searchComponents: Array<ApiComponent['type']> | false;
  usedTech?: string[] | null;
  defaultResults?: boolean;
  onPick: (obj: ApiComponent | ApiProject | TechInfo, category: string) => void;
}> = ({
  comps,
  searchProject,
  searchStack,
  searchComponents,
  usedTech,
  defaultResults,
  onPick,
}) => {
  const input = useRef<InputRef>(null);
  const [search, setSearch] = useState('');
  const [listTech, setListTech] = useState<Array<SearchResult<TechInfo>>>([]);
  const [listComps, setListComps] = useState<SearchResult[]>([]);
  const [show, setShow] = useState<boolean>(false);

  useMount(() => {
    if (input.current) {
      input.current.focus();
    }
  });

  useEffect(() => {
    const regex = new RegExp(search, 'gi');
    const _tech: Array<SearchResult<TechInfo>> = [];
    const _comps: SearchResult[] = [];

    if (searchStack) {
      for (const tech of supportedArray) {
        if (!searchStack.includes(tech.type)) {
          continue;
        }
        if (
          (search && !tech.name.match(regex)) ||
          (!search && !defaultResults)
        ) {
          continue;
        }
        _tech.push({
          type: tech,
          used: usedTech ? usedTech.includes(tech.name) : false,
        });
      }
    }

    for (const comp of comps) {
      if (!searchComponents || searchComponents.includes(comp.type) === false) {
        continue;
      }
      if (search && comp.name.match(regex)) {
        _comps.push({ type: comp, used: false });
      }
    }

    setListTech(_tech);
    setListComps(_comps);
  }, [comps, search, searchProject, searchStack]);

  const handleClickStack = (item: SearchResult<TechInfo>) => {
    if (item.used) {
      return;
    }

    setSearch('');
    onPick(item.type, 'stack');
  };

  const handleFocus = () => {
    setShow(true);
  };

  const handleBlur = () => {
    setShow(false);
  };

  return (
    <div className={cls.container}>
      <Input
        ref={input}
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={cls.search}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {show && (
        <div className={cls.list}>
          {listTech.length > 0 && (
            <div className={cls.group}>
              <div className={cls.groupTitle}>Tech</div>
              {listTech.map((item) => {
                return (
                  <div
                    key={item.type.name}
                    className={cls.item}
                    onClick={() => handleClickStack(item)}
                  >
                    {item.type.name}
                    {item.used && <IconCheck />}
                  </div>
                );
              })}
            </div>
          )}
          {searchComponents && (
            <div className={cls.group}>
              {listTech.length > 0 && (
                <div className={cls.groupTitle}>Components</div>
              )}
              {listComps.map((item) => {
                return (
                  <div key={item.type.name} className={cls.item}>
                    {item.type.name}
                  </div>
                );
              })}
              {listComps.length <= 0 && (
                <Button size="small" type="text">
                  <IconPlus /> Create Component
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const LanguageSelect: React.FC<{
  values: string[] | null;
  onChange: (values: string[]) => void;
}> = ({ onChange, values }) => {
  // const computed = useMemo(() => {
  //   return values?.map((name) => {
  //     supportedArray.find()
  //   })
  // }, []);

  const options = useMemo<DefaultOptionType[]>(() => {
    const _lang: DefaultOptionType[] = [];

    for (const tech of supportedArray) {
      if (tech.type === 'language') {
        _lang.push({
          label: tech.name,
          value: tech.key,
        });
        continue;
      }
    }

    return _lang;
  }, []);

  return (
    <Select
      style={{ width: '100%' }}
      autoFocus={true}
      mode="tags"
      allowClear
      value={values}
      options={options}
      onChange={onChange}
    />
  );
};
