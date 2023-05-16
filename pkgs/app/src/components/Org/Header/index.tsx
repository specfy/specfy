import { IconHome, IconSettings, IconUsers } from '@tabler/icons-react';
import { Badge, Menu, Typography } from 'antd';
import type { ApiOrg } from 'api/src/types/api';
import { useState, useMemo, useEffect } from 'react';
import { useLocation, Link, useParams } from 'react-router-dom';

import { useCountPerms } from '../../../api';
import type { RouteOrg } from '../../../types/routes';

import cls from './index.module.scss';

export const OrgHeader: React.FC<{ org: ApiOrg }> = ({ org }) => {
  const params = useParams<Partial<RouteOrg>>() as RouteOrg;
  const location = useLocation();

  const [selected, setSelected] = useState<string>('');
  const linkSelf = useMemo(() => {
    return `/${params.org_id}/_`;
  }, [params]);

  const resCount = useCountPerms({ org_id: params.org_id });

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
      // {
      //   key: 'flow',
      //   label: (
      //     <Link to={`${linkSelf}/flow`}>
      //       <span>
      //         <IconApps />
      //       </span>
      //       Flow
      //     </Link>
      //   ),
      // },
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
      {
        key: 'team',
        label: (
          <Link to={`${linkSelf}/team`}>
            <span>
              <IconUsers />
            </span>
            Team
            <Badge count={resCount.data?.data} showZero={false} />
          </Link>
        ),
      },
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
  }, [linkSelf, resCount]);

  useEffect(() => {
    const path = location.pathname.split('/');
    if (path[3] === 'content') {
      setSelected('content');
    } else if (path[3] === 'graph') {
      setSelected('graph');
    } else if (path[3] === 'activity') {
      setSelected('activity');
    } else if (path[3] === 'settings') {
      setSelected('settings');
    } else if (path[3] === 'team') {
      setSelected('team');
    } else if (path[3] === 'policies') {
      setSelected('policies');
    } else {
      setSelected('home');
    }
  }, [location]);

  return (
    <div className={cls.header}>
      <div className={cls.avatar}></div>
      <div className={cls.description}>
        <Typography.Title level={1}>{org!.name}</Typography.Title>

        <Menu
          selectedKeys={[selected]}
          mode="horizontal"
          items={menu}
          className={cls.menu}
        />
      </div>
    </div>
  );
};
