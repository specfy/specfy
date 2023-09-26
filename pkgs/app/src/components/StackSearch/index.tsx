import { supportedTypeToText } from '@specfy/models/src/components/constants';
import { useCallback, useEffect, useMemo } from 'react';

import type { ComponentType, ApiComponent } from '@specfy/models';

import { MultiSelect } from '../Form/MultiSelect';
import { createLocal } from '@/common/components';
import { useComponentsStore, useProjectStore } from '@/common/store';
import { slugify } from '@/common/string';
import { supportedArray, supportedIndexed } from '@/common/techs';

import type { OptionGroup, OptionValue } from '../Form/MultiSelect';

export const LanguageSelect: React.FC<{
  values: ApiComponent['techs'];
  onChange: (values: ApiComponent['techs']) => void;
}> = ({ onChange, values }) => {
  const options = useMemo<OptionGroup[]>(() => {
    const _langs: OptionValue[] = [];
    const _tools: OptionValue[] = [];
    const _cis: OptionValue[] = [];

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

  const onCreate = (opt: OptionValue) => {
    onChange([...(values || []), { id: opt.value }]);
  };

  const computedValues = useMemo(() => {
    return values.map((tech) => {
      return tech.id;
    });
  }, [values]);

  const onChangeResolve = useCallback(
    (items: string[]) => {
      const computed: ApiComponent['techs'] = [];
      for (const item of items) {
        const prev = values.find((tech) => tech.id === item);
        if (prev) {
          computed.push(prev);
        } else {
          computed.push({ id: item });
        }
      }
      onChange(computed);
    },
    [onChange, values]
  );

  return (
    <MultiSelect
      autoFocus={true}
      allowClear
      multiple={true}
      values={computedValues}
      options={options}
      onChange={onChangeResolve}
      onCreate={onCreate}
    />
  );
};

type OptionData =
  | {
      type: 'component';
    }
  | {
      type: 'project';
      projectId: string;
      create: true;
    }
  | {
      type: 'tech';
      techType: string;
      filter: string;
      create: true;
    };

// Please lord forgive me
// When we create a new Component we modify the storeComponents,
// but because it's an immutable reference if I send this update to the parent it hasn't yet rerender,
// = the storeComponents reference is not updated and it breaks.
// What I do is store the update for the next cycle because it will (hopefully) rerender everything.
// A better alternative would be to replace all callbacks by an EventBus and apply modification outside the components
let afterRender: string | null = null;

export const defaultFilterSelect: ComponentType[] = [
  'analytics',
  'api',
  'app',
  'ci',
  'db',
  'etl',
  'monitoring',
  'messaging',
  'network',
  'project',
  'saas',
  'storage',
  'service',
];
export const ComponentSelect: React.FC<{
  values: ApiComponent[];
  createdAs: 'hosting' | 'service';
  filter?: ComponentType[];
  current?: ApiComponent;
  multiple?: false;
  onChange: (values: string[]) => void;
}> = ({
  onChange,
  values,
  current,
  multiple,
  filter = defaultFilterSelect,
  createdAs,
}) => {
  const storeComponents = useComponentsStore();
  const storeProject = useProjectStore();

  const optionsComponents = useMemo<Array<OptionValue<OptionData>>>(() => {
    const tmp: Array<OptionValue<OptionData>> = [];
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
        data: { type: 'component' },
      });
    }

    return tmp;
  }, [storeComponents.components]);

  const optionsTech = useMemo<Array<OptionValue<OptionData>>>(() => {
    const components = Object.values(storeComponents.components);
    const tmp: Array<OptionValue<OptionData>> = [];

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
        label: `Create ${supportedTypeToText[supp.type]} "${supp.name}"`,
        data: {
          type: 'tech',
          techType: supp.type,
          filter: supp.name,
          create: true,
        },
      });
    }

    return tmp;
  }, [storeComponents.components]);

  const optionsProjects = useMemo<Array<OptionValue<OptionData>>>(() => {
    if (!filter.includes('project')) {
      return [];
    }

    const tmp: Array<OptionValue<OptionData>> = [];
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
        data: { type: 'project', projectId: project.id, create: true },
      });
    }

    return tmp;
  }, [storeComponents.components]);

  const options = useMemo(() => {
    const res: OptionGroup[] = [];

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

  const onCreate = (option: OptionValue<OptionData>) => {
    if (!option.data) {
      // TS pleasing
      return;
    }

    // Project
    if (option.data.type === 'project') {
      const pId = option.data.projectId;
      const proj = storeProject.projects.find((p) => p.id === pId)!;
      // TODO: use id to automatically add
      const { id } = createLocal(
        {
          name: proj.name,
          slug: proj.slug,
          type: 'project',
          typeId: proj.id,
        },
        storeProject,
        storeComponents
      );
      afterRender = id;
      return;
    }
    if (option.data.type === 'tech') {
      // Tech
      const supp = supportedIndexed[option.value];

      // TODO: use id to automatically add
      const { id } = createLocal(
        {
          name: supp.name,
          slug: supp.key,
          type: supp.type,
          techId: option.value,
        },
        storeProject,
        storeComponents
      );
      afterRender = id;
      return;
    }

    const { id } = createLocal(
      {
        name: option.value,
        slug: slugify(option.value),
        type: createdAs,
      },
      storeProject,
      storeComponents
    );

    afterRender = id;
  };

  // Tricks to defer update, see afterRender comment
  useEffect(() => {
    if (!afterRender || !storeComponents.components[afterRender]) {
      return;
    }

    onChange([...computed, afterRender]);
    afterRender = null;
  }, [computed, storeComponents.components]);

  return (
    <MultiSelect
      autoFocus={true}
      values={computed}
      options={options}
      onChange={onChange}
      multiple={multiple !== false}
      onCreate={onCreate}
    />
  );

  // return (
  //   <Select
  //     style={{ width: '100%' }}
  //     autoFocus={true}
  //     showSearch
  //     autoClearSearchValue={true}
  //     notFoundContent={<>No results...</>}
  //     searchValue={search}
  //     onSearch={setSearch}
  //     mode={multiple !== false ? 'multiple' : undefined}
  //     allowClear
  //     value={computed}
  //     options={options}
  //     optionFilterProp="filter"
  //     // onChange={onChange}
  //     onSelect={onSelect}
  //     onDeselect={onDeSelect}
  //     dropdownRender={(menu) => {
  //       return (
  //         <>
  //           {menu}
  //           {search && (
  //             <div className={cls.create}>
  //               <div>
  //                 <Button display="ghost" onClick={handleAddItem}>
  //                   <IconPlus /> Create {createdAs} &quot;{search}&quot;
  //                 </Button>
  //               </div>
  //             </div>
  //           )}
  //         </>
  //       );
  //     }}
  //   />
  // );
};
