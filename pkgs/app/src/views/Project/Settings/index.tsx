import { IconSettings, IconUsers } from '@tabler/icons-react';
import { Badge, Menu } from 'antd';
import type { ApiProject } from 'api/src/types/api';
import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';

import { useCountPerms } from '../../../api';
import { Container } from '../../../components/Container';
import type { RouteProject } from '../../../types/routes';

import { SettingsGeneral } from './General';
import { SettingsTeam } from './Team';
import cls from './index.module.scss';

export const ProjectSettings: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const location = useLocation();

  // Menu
  const linkSelf = useMemo(() => {
    return `/${params.org_id}/${params.project_slug}/settings`;
  }, [params]);
  const [open, setOpen] = useState<string>('');
  const resCount = useCountPerms({
    org_id: params.org_id,
    project_id: proj.id,
  });

  const menu = useMemo(() => {
    return [
      {
        key: 'general',
        label: (
          <Link to={linkSelf} className={cls.link}>
            <IconSettings />
            General
          </Link>
        ),
      },
      {
        key: 'team',
        label: (
          <Link to={`${linkSelf}/team`} className={cls.link}>
            <IconUsers />
            Team
            <Badge count={resCount.data?.data} showZero={false} />
          </Link>
        ),
      },
    ];
  }, [linkSelf, resCount]);

  useEffect(() => {
    if (location.pathname.match(/team/)) {
      setOpen('team');
    } else {
      setOpen('general');
    }
  }, [location]);

  return (
    <Container className={cls.container}>
      <Menu selectedKeys={[open]} mode="vertical" items={menu} />

      <div className={cls.flex}>
        <Routes>
          <Route
            path="/"
            element={<SettingsGeneral proj={proj} params={params} />}
          />
          <Route path="/team" element={<SettingsTeam proj={proj} />} />
        </Routes>
      </div>
    </Container>
  );
};
