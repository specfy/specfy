import {
  IconDatabaseDollar,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';

import type { ApiOrg } from '@specfy/models';

import { Container } from '@/components/Container';
import { Flex } from '@/components/Flex';
import * as Menu from '@/components/Menu';
import { useAuth } from '@/hooks/useAuth';
import type { RouteOrg } from '@/types/routes';

import { SettingsBilling } from './Billing';
import { SettingsGeneral } from './General';
import { SettingsTeam } from './Team';
import cls from './index.module.scss';

interface MenuItem {
  key: string;
  label: React.ReactNode;
}
export const OrgSettings: React.FC<{ params: RouteOrg; org: ApiOrg }> = ({
  params,
  org,
}) => {
  const { currentPerm } = useAuth();
  const location = useLocation();

  // Menu
  const linkSelf = useMemo(() => {
    return `/${params.org_id}/_/settings`;
  }, [params]);
  const [open, setOpen] = useState<string>('');

  const menu = useMemo<MenuItem[]>(() => {
    const items: MenuItem[] = [
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

    if (currentPerm?.role === 'owner') {
      items.push({
        key: 'billing',
        label: (
          <Link to={`${linkSelf}/billing`}>
            <Flex gap="l">
              <IconDatabaseDollar />
              Billing
            </Flex>
          </Link>
        ),
      });
    }

    return items;
  }, [currentPerm]);

  useEffect(() => {
    if (location.pathname.match(/team/)) {
      setOpen('team');
    } else if (location.pathname.match(/billing/)) {
      setOpen('billing');
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
          <Route
            path="/billing"
            element={<SettingsBilling org={org} params={params} />}
          />
        </Routes>
      </Flex>
    </Container>
  );
};
