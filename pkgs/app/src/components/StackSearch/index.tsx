import { IconPlus } from '@tabler/icons-react';
import { Button, Select } from 'antd';
import type { DefaultOptionType, SelectProps } from 'antd/es/select';
import type { ApiComponent } from 'api/src/types/api';
import { useMemo, useState } from 'react';

import {
  createLocal,
  supportedArray,
  supportedIndexed,
  supportedTypeToText,
} from '../../common/component';
import { useComponentsStore, useProjectStore } from '../../common/store';
import { slugify } from '../../common/string';

import cls from './index.module.scss';

export const LanguageSelect: React.FC<{
  values: string[] | null;
  onChange: (values: string[]) => void;
}> = ({ onChange, values }) => {
  const options = useMemo<DefaultOptionType[]>(() => {
    const _lang: DefaultOptionType[] = [];

    for (const tech of supportedArray) {
      if (tech.type === 'language' || tech.type === 'tool') {
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
      value={values || []}
      options={options}
      onChange={onChange}
    />
  );
};

export const ComponentSelect: React.FC<{
  values: ApiComponent[];
  current: ApiComponent;
  filter?: Array<ApiComponent['type']>;
  multiple?: false;
  onChange: (values: string[] | string) => void;
}> = ({ onChange, values, current, multiple, filter }) => {
  const storeComponents = useComponentsStore();
  const storeProject = useProjectStore();
  const [search, setSearch] = useState('');
  const hasHost = filter?.includes('hosting');

  const options = useMemo<DefaultOptionType[]>(() => {
    const filterDefault = filter || ['component', 'project', 'thirdparty'];
    const tmp: DefaultOptionType[] = [];
    const components = Object.values(storeComponents.components);

    for (const component of components) {
      if (!filterDefault.includes(component.type)) {
        continue;
      }
      if (component.id === current.id) {
        continue;
      }
      tmp.push({
        value: component.id,
        label: component.name,
        filter: component.name,
      });
    }

    const sugg: DefaultOptionType[] = [];
    for (const supp of supportedArray) {
      if (
        (filterDefault.includes('hosting') && supp.type === 'hosting') ||
        (filterDefault.includes('thirdparty') && supp.type === 'sass') ||
        (filterDefault.includes('component') &&
          (supp.type === 'db' || supp.type === 'messaging'))
      ) {
        if (components.find((c) => c.slug === supp.key)) {
          continue;
        }

        sugg.push({
          value: supp.key,
          label: (
            <div className={cls.sugg}>
              <IconPlus /> Create {supportedTypeToText[supp.type]} &quot;
              {supp.name}&quot;
            </div>
          ),
          techType: supp.type,
          filter: supp.name,
        });
      }
    }

    const res: DefaultOptionType[] = [
      {
        label: 'Available',
        options: tmp,
      },
    ];

    if (sugg.length > 0) {
      res.push({
        label: 'Suggestions',
        options: sugg,
        optionFilterProp: 'value',
      });
    }

    return res;
  }, [storeComponents.components]);

  const computed = useMemo<string[]>(() => {
    return values.map((component) => {
      return component.id;
    });
  }, [values]);

  // Add new item
  const handleAddItem = () => {
    const slug = slugify(search);
    if (storeComponents.select(slug)) {
      return;
    }

    createLocal(
      { name: search, slug, type: hasHost ? 'hosting' : 'component' },
      storeProject,
      storeComponents
    );
    // TODO: find a way to fix this
  };

  const onSelect: SelectProps['onSelect'] = (value, option) => {
    if (!option.techType) {
      return onChange(multiple === false ? value : [...computed, value]);
    }

    const supp = supportedIndexed[option.value!];

    let type: ApiComponent['type'] = hasHost ? 'hosting' : 'component';
    if (supp) {
      if (supp.type === 'sass') type = 'thirdparty';
      else if (supp.type === 'hosting') type = 'hosting';
    }

    const id = createLocal(
      {
        name: supp.name,
        slug: supp.key,
        type,
        techId: option.value as string,
      },
      storeProject,
      storeComponents
    );
    // TODO: find a way to fix this
    // onChange([...computed, id]);
  };

  const onDeSelect = (value: string) => {
    onChange(computed.filter((val) => val !== value));
  };

  return (
    <Select
      style={{ width: '100%' }}
      autoFocus={true}
      showSearch
      autoClearSearchValue={true}
      notFoundContent={<>No results...</>}
      searchValue={search}
      onSearch={setSearch}
      mode={multiple !== false ? 'multiple' : undefined}
      allowClear
      value={computed}
      options={options}
      optionFilterProp="filter"
      // onChange={onChange}
      onSelect={onSelect}
      onDeselect={onDeSelect}
      dropdownRender={(menu) => {
        return (
          <>
            {menu}
            {search && (
              <div className={cls.create}>
                {!hasHost && (
                  <div>
                    <Button
                      type="link"
                      icon={<IconPlus />}
                      onClick={handleAddItem}
                    >
                      Create service &quot;{search}&quot;
                    </Button>
                  </div>
                )}
                {hasHost && (
                  <div>
                    <Button
                      type="link"
                      icon={<IconPlus />}
                      onClick={handleAddItem}
                    >
                      Create hosting &quot;{search}&quot;
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        );
      }}
    />
  );
};
