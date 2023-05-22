import {
  IconApps,
  IconBolt,
  IconBook,
  IconHistory,
  IconEye,
} from '@tabler/icons-react';
// import type { MenuProps } from 'antd';
import { Badge, Menu } from 'antd';
import type { ApiProject, ApiOrg } from 'api/src/types/api';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useListOrgs, useListRevisions } from '../../api';
// import { useEdit } from '../../hooks/useEdit';
import type { RouteProject } from '../../types/routes';

import cls from './index.module.scss';

export const ProjectHeader: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  // const edit = useEdit();
  // const isEditing = edit.isEnabled();

  // State
  const [org, setOrg] = useState<ApiOrg>();
  const [open, setOpen] = useState<string>('');
  // const linkOrg = useMemo(() => {
  //   return `/${params.org_id}`;
  // }, [params]);
  const linkSelf = useMemo(() => {
    return `/${params.org_id}/${params.project_slug}`;
  }, [params]);
  const location = useLocation();

  // Data
  const getOrgs = useListOrgs();
  const revisions = useListRevisions({
    org_id: params.org_id,
    project_id: proj.id,
    status: 'opened',
  });

  useEffect(() => {
    if (!getOrgs.data) {
      return;
    }

    setOrg(getOrgs.data.data.find((o) => o.id === params.org_id));
  }, [getOrgs.data]);

  // Edit mode
  // const createItems = useMemo<MenuProps['items']>(() => {
  //   return [
  //     {
  //       key: '1',
  //       label: <Link to={`${linkSelf}/content/new`}>New Content</Link>,
  //     },
  //     {
  //       key: '2',
  //       label: <Link to={`${linkSelf}/component/new`}>New Component</Link>,
  //     },
  //   ];
  // }, [linkSelf]);

  const menu = useMemo(() => {
    return [
      {
        key: 'overview',
        label: (
          <Link to={linkSelf} className={cls.link}>
            <span>
              <IconEye />
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
    ];
  }, [linkSelf, revisions]);

  useEffect(() => {
    if (location.pathname.match(/content|rfc/)) {
      setOpen('content');
    } else if (location.pathname.match(/revisions/)) {
      setOpen('revisions');
    } else if (location.pathname.match(/\/c\/|\/t\//)) {
      setOpen('overview');
    } else if (location.pathname.match(/flow/)) {
      setOpen('flow');
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

  if (open === 'settings') {
    return null;
  }

  return (
    <div className={cls.header}>
      {/* <BigHeading
        parent={org!.name}
        parentLink={linkOrg}
        title={proj.name}
        link={linkSelf}
        subtitle={
          <>
            <div className={cls.editZone}>
              <Tooltip
                title={
                  isEditing ? 'Edition is active' : 'Click to enable edition'
                }
                placement="bottomLeft"
              >
                <Button
                  icon={isEditing ? <IconEyeEdit /> : <IconEye />}
                  type="default"
                  size="small"
                  className={classnames(isEditing && cls.isEditing)}
                  onClick={() => edit.enable(!isEditing)}
                />
              </Tooltip>
              <Dropdown
                menu={{ items: createItems }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button icon={<IconPlus />} type="default" size="small" />
              </Dropdown>
              <Staging link={linkSelf} />
            </div>
          </>
        }
      ></BigHeading> */}
      <Menu
        selectedKeys={[open]}
        mode="horizontal"
        items={menu}
        className={cls.menu}
      />
    </div>
  );
};
