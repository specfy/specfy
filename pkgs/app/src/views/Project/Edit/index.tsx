import { FormOutlined, TeamOutlined } from '@ant-design/icons';
import { Menu, Typography, Space } from 'antd';
import type { ApiProject } from 'api/src/types/api/projects';
import { useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';

import { Container } from '../../../components/Container';
import type { RouteProject } from '../../../types/routes';

import { ProjectEditContent } from './Content';
import cls from './index.module.scss';

export const ProjectEdit: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  // const { message } = App.useApp();
  // const navigate = useNavigate();

  const [menu] = useState(() => {
    return [
      {
        key: 'content',
        label: (
          <Link to={`/org/${params.org_id}/${params.project_slug}/edit`}>
            <Space size={'small'}>
              <FormOutlined />
              Content
            </Space>
          </Link>
        ),
      },
      {
        key: 'team',
        label: (
          <Link to={`/org/${params.org_id}/${params.project_slug}/edit/team`}>
            <Space size={'small'}>
              <TeamOutlined />
              Team
            </Space>
          </Link>
        ),
      },
    ];
  });

  return (
    <Container className={cls.container}>
      <div className={cls.top}>
        <Typography.Title level={3}>Edit Project</Typography.Title>
      </div>

      <div className={cls.left}>
        <Menu defaultSelectedKeys={['content']} mode="inline" items={menu} />
      </div>
      <div className={cls.right}>
        <Routes>
          <Route
            path="/"
            element={<ProjectEditContent proj={proj} params={params} />}
          />
        </Routes>
      </div>
    </Container>
  );
};
