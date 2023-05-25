import { IconApps, IconHome, IconSettings } from '@tabler/icons-react';
import { Menu } from 'antd';
import type { ApiOrg } from 'api/src/types/api';
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

  const menu = useMemo(() => {
    return [
      {
        key: 'home',
        label: (
          <Link to={linkSelf}>
            <span>
              <IconHome />
            </span>
            Home
          </Link>
        ),
      },
      // {
      //   key: 'content',
      //   label: (
      //     <Link to={`${linkSelf}/content`}>
      //       <span>
      //         <IconBook />
      //       </span>
      //       Content
      //     </Link>
      //   ),
      // },
      {
        key: 'flow',
        label: (
          <Link to={`${linkSelf}/flow`}>
            <span>
              <IconApps />
            </span>
            Flow
          </Link>
        ),
      },
      // {
      //   key: 'policies',
      //   label: (
      //     <Link to={`${linkSelf}/policies`}>
      //       <span>
      //         <IconSchool />
      //       </span>
      //       Policies
      //     </Link>
      //   ),
      // },
      // {
      //   key: 'team',
      //   label: (
      //     <Link to={`${linkSelf}/team`}>
      //       <span>
      //         <IconUsers />
      //       </span>
      //       Team
      //       <Badge count={resCount.data?.data} showZero={false} />
      //     </Link>
      //   ),
      // },
      // {
      //   key: 'activity',
      //   label: (
      //     <Link to={`${linkSelf}/activity`}>
      //       <span>
      //         <IconBolt />
      //       </span>
      //       Activity
      //     </Link>
      //   ),
      // },
      {
        key: 'settings',
        label: (
          <Link to={`${linkSelf}/settings`}>
            <span>
              <IconSettings />
            </span>
            Settings
          </Link>
        ),
      },
    ];
  }, [linkSelf]);

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
      <Menu selectedKeys={[open]} mode="horizontal" items={menu} />
    </div>
  );
};
