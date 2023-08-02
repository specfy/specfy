import type { ApiOrg } from '@specfy/api/src/types/api';
import { IconApps, IconHome, IconSettings } from '@tabler/icons-react';
import { useState, useMemo, useEffect } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';

import * as Menu from '../../../components/Menu';
import type { RouteOrg } from '../../../types/routes';
import { Flex } from '../../Flex';

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

  const menu = useMemo(() => {
    return [
      {
        key: 'home',
        label: (
          <Link to={linkSelf}>
            <Flex gap="l">
              <IconHome />
              Home
            </Flex>
          </Link>
        ),
      },
      {
        key: 'flow',
        label: (
          <Link to={`${linkSelf}/flow`}>
            <Flex gap="l">
              <IconApps />
              Flow
            </Flex>
          </Link>
        ),
      },
      {
        key: 'settings',
        label: (
          <Link to={`${linkSelf}/settings`}>
            <Flex gap="l">
              <IconSettings />
              Settings
            </Flex>
          </Link>
        ),
      },
    ];
  }, [linkSelf]);

  return (
    <div className={cls.header}>
      <Menu.Menu>
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
    </div>
  );
};
