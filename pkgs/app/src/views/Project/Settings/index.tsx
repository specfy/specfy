import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import type { ApiProject } from '@specfy/api/src/types/api';
import { IconSettings, IconUsers } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';

import { useCountPerms } from '../../../api';
import { Badge } from '../../../components/Badge';
import { Container } from '../../../components/Container';
import { Flex } from '../../../components/Flex';
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
            <Flex gap="l">
              <IconSettings />
              General
            </Flex>
          </Link>
        ),
      },
      {
        key: 'team',
        label: (
          <Link to={`${linkSelf}/team`} className={cls.link}>
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
    } else {
      setOpen('general');
    }
  }, [location]);

  return (
    <Container className={cls.container}>
      <NavigationMenu.Root orientation="vertical" className="rx_navMenuRoot">
        <NavigationMenu.List className="rx_navMenuList">
          {menu.map((item) => {
            return (
              <NavigationMenu.Item className="rx_navMenuItem" key={item.key}>
                <NavigationMenu.Link
                  asChild
                  className="rx_navMenuLink"
                  active={open === item.key}
                >
                  {item.label}
                </NavigationMenu.Link>
              </NavigationMenu.Item>
            );
          })}
        </NavigationMenu.List>
      </NavigationMenu.Root>

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
