import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import type { ApiProject } from '@specfy/api/src/types/api';
import {
  IconApps,
  IconBolt,
  IconBook,
  IconCloudUpload,
  IconHistory,
  IconLayoutDashboard,
  IconSettings,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useListRevisions } from '../../../api';
import { useOrgStore } from '../../../common/store';
import type { RouteProject } from '../../../types/routes';
import { Badge } from '../../Badge';

import cls from './index.module.scss';

export const ProjectHeader: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  // State
  const [open, setOpen] = useState<string>('');
  const linkSelf = useMemo(() => {
    return `/${params.org_id}/${params.project_slug}`;
  }, [params]);
  const location = useLocation();

  // Data
  const { current: org } = useOrgStore();
  const revisions = useListRevisions({
    org_id: params.org_id,
    project_id: proj.id,
    status: 'opened',
  });

  const menu = useMemo(() => {
    const items = [
      {
        key: 'overview',
        label: (
          <Link to={linkSelf} className={cls.link}>
            <span>
              <IconLayoutDashboard />
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
        key: 'flow',
        label: (
          <Link to={`${linkSelf}/flow`} className={cls.link}>
            <span>
              <IconApps />
            </span>
            Flow
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
        key: 'deploys',
        label: (
          <Link to={`${linkSelf}/deploys`} className={cls.link}>
            <span>
              <IconCloudUpload />
            </span>
            Deploys
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

    return items;
  }, [linkSelf, revisions]);

  useEffect(() => {
    if (location.pathname.match(/content|rfc/)) {
      setOpen('content');
    } else if (location.pathname.match(/\/c\/|\/t\//)) {
      setOpen('overview');
    } else if (location.pathname.match(/flow/)) {
      setOpen('flow');
    } else if (location.pathname.match(/revisions/)) {
      setOpen('revisions');
    } else if (location.pathname.match(/deploys/)) {
      setOpen('deploys');
    } else if (location.pathname.match(/activity/)) {
      setOpen('activity');
    } else if (location.pathname.match(/settings/)) {
      setOpen('settings');
    } else {
      setOpen('overview');
    }
  }, [location]);

  if (!org) {
    return null;
  }

  return (
    <div className={cls.header}>
      <NavigationMenu.Root className="rx_navMenuRoot">
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
    </div>
  );
};
