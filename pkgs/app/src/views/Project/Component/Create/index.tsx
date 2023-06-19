import { IconCircleArrowRight } from '@tabler/icons-react';
import { Button, Input, Select, Typography } from 'antd';
import type { ApiComponent } from 'api/src/types/api';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { createLocal, internalTypeToText } from '../../../../common/component';
import { useComponentsStore, useProjectStore } from '../../../../common/store';
import { slugify, titleSuffix } from '../../../../common/string';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

export const ProjectComponentCreate: React.FC<{ params: RouteProject }> = ({
  params,
}) => {
  const navigate = useNavigate();
  const storeComponents = useComponentsStore();
  const storeProject = useProjectStore();

  const [options] = useState(() => {
    const tmp = [];
    for (const [value, label] of Object.entries(internalTypeToText)) {
      if (value === 'project') {
        continue;
      }
      tmp.push({ value, label });
    }
    return tmp;
  });
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<ApiComponent['type']>('component');

  const onFinish = async () => {
    const slug = slugify(name);
    const id = createLocal({ name, slug, type }, storeProject, storeComponents);

    navigate(`/${params.org_id}/${params.project_slug}/c/${id}-${slug}`);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onFinish();
      }}
      className={cls.form}
    >
      <Helmet
        title={`Create Component - ${
          storeProject.project!.name
        } ${titleSuffix}`}
      />
      <Typography.Title level={4}>Create Component</Typography.Title>
      <Select
        options={options}
        size="large"
        className={cls.type}
        value={type}
        onChange={setType}
      />
      <div className={cls.title}>
        <Input
          size="large"
          placeholder="Component name..."
          className={cls.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          type="primary"
          disabled={!name || name.length < 2}
          className={cls.button}
          onClick={onFinish}
          htmlType="submit"
          icon={<IconCircleArrowRight />}
        ></Button>
      </div>
    </form>
  );
};
