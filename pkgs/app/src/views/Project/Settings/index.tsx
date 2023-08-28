import type { ApiProject } from '@specfy/models';
import { IconBrandGithub, IconSettings, IconUsers } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';

import { useCountPerms } from '../../../api';
import { Badge } from '../../../components/Badge';
import { Container } from '../../../components/Container';
import { Flex } from '../../../components/Flex';
import * as Menu from '../../../components/Menu';
import type { RouteProject } from '../../../types/routes';

import { SettingsGeneral } from './General';
import { SettingsSync } from './Sync';
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
          <Link to={linkSelf}>
            <Flex gap="l">
              <IconSettings />
              General
            </Flex>
          </Link>
        ),
      },
      {
        key: 'sync',
        label: (
          <Link to={`${linkSelf}/sync`}>
            <Flex gap="l">
              <IconBrandGithub />
              Github Sync
            </Flex>
          </Link>
        ),
      },
      {
        key: 'team',
        label: (
          <Link to={`${linkSelf}/team`}>
            <Flex gap="l">
              <IconUsers />
              Team
            </Flex>
            <Badge count={resCount.data?.data} showZero={false} />
          </Link>
        ),
      },
    ];
  }, [linkSelf, resCount]);

  useEffect(() => {
    if (location.pathname.match(/team/)) {
      setOpen('team');
    } else if (location.pathname.match(/sync/)) {
      setOpen('sync');
    } else {
      setOpen('general');
    }
  }, [location]);

  return (
    <Container className={cls.container}>
      <Menu.Menu orientation="vertical">
        <Menu.List>
          {menu.map((item) => {
            return (
              <Menu.Item key={item.key}>
                <Menu.Link asChild active={open === item.key}>
                  {item.label}
                </Menu.Link>
              </Menu.Item>
            );
          })}
        </Menu.List>
      </Menu.Menu>

      <Flex gap="2xl" column align="initial">
        <Routes>
          <Route
            path="/"
            element={<SettingsGeneral proj={proj} params={params} />}
          />
          <Route path="/sync" element={<SettingsSync proj={proj} />} />
          <Route path="/team" element={<SettingsTeam proj={proj} />} />
        </Routes>
      </Flex>
    </Container>
  );
};
