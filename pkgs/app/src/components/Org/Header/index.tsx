import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import type { ApiOrg } from '@specfy/api/src/types/api';
import { IconApps, IconHome, IconSettings } from '@tabler/icons-react';
import { useState, useMemo, useEffect } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';

import type { RouteOrg } from '../../../types/routes';

import cls from './index.module.scss';

export const OrgHeader: React.FC<{ org: ApiOrg }> = () => {
  const params = useParams<Partial<RouteOrg>>() as RouteOrg;
  const location = useLocation();

  const [open, setOpen] = useState<string>('');
  const linkSelf = useMemo(() => {
    return `/${params.org_id}/_`;
  }, [params]);

  useEffect(() => {
    const path = location.pathname.split('/');
    if (path[3] === 'content') {
      setOpen('content');
    } else if (path[3] === 'flow') {
      setOpen('flow');
    } else if (path[3] === 'activity') {
      setOpen('activity');
    } else if (path[3] === 'settings') {
      setOpen('settings');
    } else if (path[3] === 'team') {
      setOpen('team');
    } else if (path[3] === 'policies') {
      setOpen('policies');
    } else {
      setOpen('home');
    }
  }, [location]);

  return (
    <div className={cls.header}>
      <NavigationMenu.Root className="rx_navMenuRoot">
        <NavigationMenu.List className="rx_navMenuList">
          <NavigationMenu.Item className="rx_navMenuItem">
            <NavigationMenu.Link
              asChild
              className="rx_navMenuLink"
              active={open === 'home'}
            >
              <Link to={linkSelf}>
                <span>
                  <IconHome />
                </span>
                Home
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>

          <NavigationMenu.Item className="rx_navMenuItem">
            <NavigationMenu.Link
              asChild
              className="rx_navMenuLink"
              active={open === 'flow'}
            >
              <Link to={`${linkSelf}/flow`}>
                <span>
                  <IconApps />
                </span>
                Flow
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>

          <NavigationMenu.Item className="rx_navMenuItem">
            <NavigationMenu.Link
              asChild
              className="rx_navMenuLink"
              active={open === 'settings'}
            >
              <Link to={`${linkSelf}/settings`}>
                <span>
                  <IconSettings />
                </span>
                Settings
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>
      </NavigationMenu.Root>
    </div>
  );
};
