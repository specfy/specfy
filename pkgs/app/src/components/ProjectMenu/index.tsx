import {
  IconApps,
  IconBolt,
  IconBook,
  IconHistory,
  IconHome,
  IconSettings,
} from '@tabler/icons-react';
import { Badge, Menu } from 'antd';
import type { ApiProject } from 'api/src/types/api';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useListRevisions } from '../../api/revisions';
import type { RouteProject } from '../../types/routes';

import cls from './index.module.scss';

export const ProjectMenu: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const linkSelf = useMemo(() => {
    return `/${params.org_id}/${params.project_slug}`;
  }, [params]);
  const revisions = useListRevisions({
    org_id: params.org_id,
    project_id: proj.id,
    status: 'opened',
  });
  const location = useLocation();

  const [open, setOpen] = useState<string>('');

  const menu = useMemo(() => {
    return [
      {
        key: 'overview',
        label: (
          <Link to={linkSelf} className={cls.link}>
            <span>
              <IconHome />
            </span>
            Overview
          </Link>
        ),
      },
      {
        key: 'content',
        label: (
          <Link to={`${linkSelf}/content`} className={cls.link}>
            <span>
              <IconBook />
            </span>
            Content
          </Link>
        ),
      },
      {
        key: 'graph',
        label: (
          <Link to={`${linkSelf}/graph`} className={cls.link}>
            <span>
              <IconApps />
            </span>
            Graph
          </Link>
        ),
      },
      {
        key: 'revisions',
        label: (
          <Link to={`${linkSelf}/revisions`} className={cls.link}>
            <span>
              <IconHistory />
            </span>
            <div className={cls.badged}>
              Revisions
              <Badge
                count={revisions.data?.pagination.totalItems}
                showZero={false}
              />
            </div>
          </Link>
        ),
      },
      {
        key: 'activity',
        label: (
          <Link to={`${linkSelf}/activity`} className={cls.link}>
            <span>
              <IconBolt />
            </span>
            Activity
          </Link>
        ),
      },
      {
        key: 'settings',
        label: (
          <Link to={`${linkSelf}/settings`} className={cls.link}>
            <span>
              <IconSettings />
            </span>
            Settings
          </Link>
        ),
      },
    ];
  }, [linkSelf, revisions]);

  useEffect(() => {
    if (location.pathname.match(/content|rfc/)) {
      setOpen('content');
    } else if (location.pathname.match(/revisions/)) {
      setOpen('revisions');
    } else if (location.pathname.match(/\/c\/|\/t\//)) {
      setOpen('home');
    } else if (location.pathname.match(/graph/)) {
      setOpen('graph');
    } else if (location.pathname.match(/activity/)) {
      setOpen('activity');
    } else if (location.pathname.match(/settings/)) {
      setOpen('settings');
    } else {
      setOpen('overview');
    }
  }, [location]);

  return (
    <Menu
      selectedKeys={[open]}
      mode="horizontal"
      items={menu}
      className={cls.menu}
    />
  );
};
