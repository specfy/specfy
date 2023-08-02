import type { ApiOrg } from '@specfy/api/src/types/api';
import { IconSettings, IconUsers } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';

import { Container } from '../../../components/Container';
import { Flex } from '../../../components/Flex';
import * as Menu from '../../../components/Menu';
import type { RouteOrg } from '../../../types/routes';

import { SettingsGeneral } from './General';
import { SettingsTeam } from './Team';
import cls from './index.module.scss';

export const OrgSettings: React.FC<{ params: RouteOrg; org: ApiOrg }> = ({
  params,
  org,
}) => {
  const location = useLocation();

  // Menu
  const linkSelf = useMemo(() => {
    return `/${params.org_id}/_/settings`;
  }, [params]);
  const [open, setOpen] = useState<string>('');

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
        key: 'team',
        label: (
          <Link to={`${linkSelf}/team`}>
            <Flex gap="l">
              <IconUsers />
              Team
            </Flex>
          </Link>
        ),
      },
    ];
  }, []);

  useEffect(() => {
    if (location.pathname.match(/team/)) {
      setOpen('team');
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
            element={<SettingsGeneral params={params} org={org} />}
          />
          <Route
            path="/team"
            element={<SettingsTeam org={org} params={params} />}
          />
        </Routes>
      </Flex>
    </Container>
  );
};
