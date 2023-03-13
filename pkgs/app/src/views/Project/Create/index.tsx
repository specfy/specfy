import { IconCircleArrowRight } from '@tabler/icons-react';
import { App, Button, Input, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createProject } from '../../../api/projects';
import type { RouteOrg } from '../../../types/routes';

import cls from './index.module.scss';

export const ProjectCreate: React.FC<{ params: RouteOrg }> = ({ params }) => {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');

  const onFinish = async (e) => {
    e.preventDefault();
    const { slug } = await createProject({ name, orgId: params.org_id });
    message.success('Project created');

    navigate(`/${params.org_id}/${slug}`);
  };

  return (
    <form onSubmit={onFinish} className={cls.form}>
      <Typography.Title level={4}>Create Project</Typography.Title>
      <div className={cls.title}>
        <Input
          size="large"
          placeholder="Project name..."
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
