import { IconCircleArrowRight } from '@tabler/icons-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { createLocal } from '@/common/components';
import { useComponentsStore, useProjectStore } from '@/common/store';
import { slugify, titleSuffix } from '@/common/string';
import { Button } from '@/components/Form/Button';
import { Input } from '@/components/Form/Input';
import type { RouteProject } from '@/types/routes';

import cls from './index.module.scss';

export const ProjectComponentCreate: React.FC<{ params: RouteProject }> = ({
  params,
}) => {
  const navigate = useNavigate();
  const storeComponents = useComponentsStore();
  const storeProject = useProjectStore();

  const [name, setName] = useState<string>('');

  const onFinish = () => {
    const slug = slugify(name);
    const { id } = createLocal(
      { name, slug, type: 'service' },
      storeProject,
      storeComponents
    );

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
      <h4>Create Component</h4>

      <div className={cls.title}>
        <Input
          size="l"
          placeholder="Component name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          display="primary"
          disabled={!name || name.length < 2}
          onClick={onFinish}
          type="submit"
          size="xl"
        >
          <IconCircleArrowRight /> Create
        </Button>
      </div>
    </form>
  );
};
