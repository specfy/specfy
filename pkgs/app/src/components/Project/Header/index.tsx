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
import * as Menu from '../../../components/Menu';
import type { RouteProject } from '../../../types/routes';
import { Badge } from '../../Badge';
import { Flex } from '../../Flex';

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
          <Link to={linkSelf}>
            <Flex gap="l">
              <IconLayoutDashboard />
              Overview
            </Flex>
          </Link>
        ),
      },
      {
        key: 'content',
        label: (
          <Link to={`${linkSelf}/content`}>
            <Flex gap="l">
              <IconBook />
              Content
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
        key: 'revisions',
        label: (
          <Link to={`${linkSelf}/revisions`}>
            <Flex gap="l">
              <IconHistory />
              Revisions
            </Flex>
            <div>
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
          <Link to={`${linkSelf}/deploys`}>
            <Flex gap="l">
              <IconCloudUpload />
              Deploys
            </Flex>
          </Link>
        ),
      },
      {
        key: 'activity',
        label: (
          <Link to={`${linkSelf}/activity`}>
            <Flex gap="l">
              <IconBolt />
              Activity
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
