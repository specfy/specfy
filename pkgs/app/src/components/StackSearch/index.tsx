import { Select } from 'antd';
import type { DefaultOptionType } from 'antd/es/select';
import type { ApiComponent } from 'api/src/types/api';
import { useMemo } from 'react';

import { supportedArray } from '../../common/component';

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
  components: ApiComponent[];
  current: ApiComponent;
  onChange: (values: string[]) => void;
}> = ({ onChange, values, components, current }) => {
  const options = useMemo<DefaultOptionType[]>(() => {
    const tmp: DefaultOptionType[] = [];
    for (const component of components) {
      if (component.type === 'hosting') {
        continue;
      }
      if (component.id === current.id) {
        continue;
      }
      tmp.push({ value: component.id, label: component.name });
    }
    return tmp;
  }, [components]);

  const computed = useMemo<string[]>(() => {
    return values.map((component) => {
      return component.id;
    });
  }, [values]);

  return (
    <Select
      style={{ width: '100%' }}
      autoFocus={true}
      mode="multiple"
      allowClear
      value={computed}
      options={options}
      optionFilterProp="label"
      onChange={onChange}
    />
  );
};
