import { IconCircleArrowRight } from '@tabler/icons-react';
import { App, Button, Input, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createProject } from '../../../api/projects';
import { useProjectStore } from '../../../common/store';
import type { RouteOrg } from '../../../types/routes';

import cls from './index.module.scss';

export const ProjectCreate: React.FC<{ params: RouteOrg }> = ({ params }) => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const storeProjects = useProjectStore();

  const [name, setName] = useState<string>('');

  const onFinish = async (e) => {
    e.preventDefault();

    // Compute global bounding box
    const global = { x: 0, y: 0, width: 0, height: 0 };
    for (const proj of Object.values(storeProjects.projects)) {
      global.x = Math.min(proj.display.pos.x, global.x);
      global.y = Math.min(proj.display.pos.y, global.y);
      global.width = Math.max(proj.display.pos.width, global.width);
      global.height = Math.max(proj.display.pos.height, global.height);
    }

    // Simply add on top of it
    const pos = { x: global.x, y: global.y - 32 };

    const { slug } = await createProject({
      name,
      orgId: params.org_id,
      display: { pos },
    });
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
          autoFocus
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
