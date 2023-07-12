import type { ApiComponent } from '@specfy/api/src/types/api';
import type { ComponentType } from '@specfy/api/src/types/db';
import { IconPlus } from '@tabler/icons-react';
import { Button, Select } from 'antd';
import type { DefaultOptionType, SelectProps } from 'antd/es/select';
import { useMemo, useState } from 'react';

import { createLocal } from '../../common/components';
import { useComponentsStore, useProjectStore } from '../../common/store';
import { slugify } from '../../common/string';
import {
  supportedArray,
  supportedIndexed,
  supportedTypeToText,
} from '../../common/techs';

import cls from './index.module.scss';

export const LanguageSelect: React.FC<{
  values: string[] | null;
  onChange: (values: string[]) => void;
}> = ({ onChange, values }) => {
  const options = useMemo<DefaultOptionType[]>(() => {
    const _langs: DefaultOptionType[] = [];
    const _tools: DefaultOptionType[] = [];
    const _cis: DefaultOptionType[] = [];

    for (const tech of supportedArray) {
      if (tech.type === 'language') {
        _langs.push({
          label: tech.name,
          value: tech.key,
        });
        continue;
      }
      if (tech.type === 'tool') {
        _tools.push({
          label: tech.name,
          value: tech.key,
        });
        continue;
      }
      if (tech.type === 'ci') {
        _cis.push({
          label: tech.name,
          value: tech.key,
        });
        continue;
      }
    }

    return [
      {
        label: 'Languages',
        options: _langs,
      },
      { label: 'Tools', options: _tools },
      { label: 'CI', options: _cis },
    ];
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
  createdAs: 'hosting' | 'service';
  filter?: ComponentType[];
  current?: ApiComponent;
  multiple?: false;
  onChange: (values: string[] | string) => void;
}> = ({
  onChange,
  values,
  current,
  multiple,
  filter = [
    'app',
    'ci',
    'db',
    'messaging',
    'network',
    'project',
    'sass',
    'storage',
    'service',
  ],
  createdAs,
}) => {
  const storeComponents = useComponentsStore();
  const storeProject = useProjectStore();
  const [search, setSearch] = useState('');

  const optionsComponents = useMemo<DefaultOptionType[]>(() => {
    const tmp: DefaultOptionType[] = [];
    const components = Object.values(storeComponents.components);

    // Components
    for (const component of components) {
      if (!filter.includes(component.type)) {
        continue;
      }
      if (current && component.id === current.id) {
        continue;
      }
      tmp.push({
        value: component.id,
        label: component.name,
        filter: component.name,
      });
    }

    return tmp;
  }, [storeComponents.components]);

  const optionsTech = useMemo<DefaultOptionType[]>(() => {
    const components = Object.values(storeComponents.components);
    const tmp: DefaultOptionType[] = [];

    for (const supp of supportedArray) {
      if (supp.type === 'language') {
        continue;
      }
      if (!filter.includes(supp.type)) {
        continue;
      }
      if (components.find((c) => c.techId === supp.key)) {
        continue;
      }

      tmp.push({
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

    return tmp;
  }, [storeComponents.components]);

  const optionsProjects = useMemo<DefaultOptionType[]>(() => {
    if (!filter.includes('project')) {
      return [];
    }

    const tmp: DefaultOptionType[] = [];
    const curr =
      storeComponents.current &&
      storeComponents.components[storeComponents.current];
    const created = Object.values(storeComponents.components).filter(
      (c) => c.type === 'project'
    );

    for (const project of storeProject.projects) {
      if (curr && project.id === curr.id) {
        continue;
      }
      if (created.find((c) => c.typeId === project.id)) {
        continue;
      }

      tmp.push({
        value: project.id,
        label: project.name,
        filter: project.name,
        projectId: project.id,
      });
    }

    return tmp;
  }, [storeComponents.components]);

  const options = useMemo(() => {
    const res: DefaultOptionType[] = [];

    if (optionsComponents.length > 0) {
      res.push({
        label: 'Available',
        options: optionsComponents,
      });
    }
    if (optionsProjects.length > 0) {
      res.push({
        label: 'Projects',
        options: optionsProjects,
      });
    }

    if (optionsTech.length > 0) {
      res.push({
        label: 'Suggestions',
        options: optionsTech,
      });
    }

    return res;
  }, [optionsComponents, optionsTech, optionsProjects]);

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
      { name: search, slug, type: createdAs },
      storeProject,
      storeComponents
    );
    // TODO: find a way to fix this
  };

  const onSelect: SelectProps['onSelect'] = (value, option) => {
    // Classic component
    if (!option.techType && !option.projectId) {
      return onChange(multiple === false ? value : [...computed, value]);
    }

    // Project
    if (option.projectId) {
      const proj = storeProject.projects.find(
        (p) => p.id === option.projectId
      )!;
      // TODO: use id to automatically add
      createLocal(
        {
          name: proj.name,
          slug: proj.slug,
          type: 'project',
          typeId: proj.id,
        },
        storeProject,
        storeComponents
      );
      return;
    }

    // Tech
    const supp = supportedIndexed[option.value!];

    // TODO: use id to automatically add
    createLocal(
      {
        name: supp.name,
        slug: supp.key,
        type: supp.type,
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
                <div>
                  <Button
                    type="link"
                    icon={<IconPlus />}
                    onClick={handleAddItem}
                  >
                    Create {createdAs} &quot;{search}&quot;
                  </Button>
                </div>
              </div>
            )}
          </>
        );
      }}
    />
  );
};
