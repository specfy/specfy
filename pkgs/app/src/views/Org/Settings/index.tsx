import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import type { ApiOrg } from 'api/src/types/api';
import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useLocation } from 'react-router-dom';

import { Container } from '../../../components/Container';
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
          <NavigationMenu.Item className="rx_navMenuItem">
            <NavigationMenu.Link
              className="rx_navMenuLink"
              active={open === 'general'}
              asChild
            >
              <Link to={linkSelf}>General</Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item className="rx_navMenuItem">
            <NavigationMenu.Link
              className="rx_navMenuLink"
              active={open === 'team'}
              asChild
            >
              <Link to={`${linkSelf}/team`}>Team</Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>

      <div className={cls.flex}>
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
      </div>
    </Container>
  );
};
