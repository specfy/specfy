import {
  IconApps,
  IconBolt,
  // IconBook,
  IconChevronDown,
  IconCircleDot,
  IconCloudUpload,
  IconHistory,
  IconPlus,
  IconSettings,
} from '@tabler/icons-react';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import type { ApiProject } from '@specfy/models';

import { Badge } from '../../Badge';
import { useListRevisions } from '@/api';
import { useOrgStore, useProjectStore } from '@/common/store';
import { AvatarAuto } from '@/components/AvatarAuto';
import * as Dropdown from '@/components/Dropdown';
import { Flex } from '@/components/Flex';
import * as Menu from '@/components/Menu';
import type { RouteProject } from '@/types/routes';

import cls from './index.module.scss';

export const ProjectSwitcher: React.FC = () => {
  const { project, projects } = useProjectStore();
  const loc = useLocation();
  const paths = useMemo<string>(() => {
    if (!project) {
      return '';
    }
    const fp = loc.pathname?.replace(`/${project.orgId}/${project.slug}`, '');
    const slash = fp.match(/\//g);
    if (slash && slash.length > 1) {
      return '';
    }
    return fp;
  }, [loc, project]);

  if (!project) {
    return null;
  }

  return (
    <div>
      <Dropdown.Menu>
        <Dropdown.Trigger asChild>
          <button className={cls.switcher}>
            <div className={cls.name}>
              <AvatarAuto name={project.name} shape="square" size="s" />
              {project.name}
            </div>
            <IconChevronDown />
          </button>
        </Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Group className={cls.content}>
            {projects.map((item) => {
              return (
                <Dropdown.Item key={item.id} asChild>
                  <Link
                    to={`/${item.orgId}/${item.slug}${paths}`}
                    className={classNames(
                      cls.project,
                      project.id === item.id && cls.current
                    )}
                  >
                    <AvatarAuto name={item.name} shape="square" size="s" />{' '}
                    {item.name}
                  </Link>
                </Dropdown.Item>
              );
            })}
          </Dropdown.Group>
          <Dropdown.Separator />
          <Dropdown.Group>
            <Dropdown.Item asChild>
              <Link
                to={`/${project.orgId}/_/project/new`}
                className={cls.project}
              >
                <IconPlus size="1em" />
                Create project
              </Link>
            </Dropdown.Item>
          </Dropdown.Group>
        </Dropdown.Content>
      </Dropdown.Menu>
    </div>
  );
};

export const ProjectMenu: React.FC<{
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
              <IconCircleDot />
              Overview
            </Flex>
          </Link>
        ),
      },
      // {
      //   key: 'content',
      //   label: (
      //     <Link to={`${linkSelf}/content`}>
      //       <Flex gap="l">
      //         <IconBook />
      //         Content
      //       </Flex>
      //     </Link>
      //   ),
      // },
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
    if (location.pathname.match(/content|rfc|doc/)) {
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
    <>
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
    </>
  );
};
