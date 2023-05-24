import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconHome,
  IconSettings,
} from '@tabler/icons-react';
import { Button } from 'antd';
import type { ApiOrg, ApiProject } from 'api/src/types/api';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { AvatarAuto } from '../AvatarAuto';
import { Staging } from '../ProjectHeader/Staging';

import cls from './index.module.scss';

export const Group: React.FC<{
  children: React.ReactElement | React.ReactElement[];
  name: string;
  actions?: React.ReactElement;
}> = ({ children, name, actions }) => {
  const [open, setOpen] = useState(true);
  const onClick = () => {
    setOpen(!open);
  };

  return (
    <div className={classNames(cls.group, !open && cls.hide)}>
      <div className={cls.head} role="button" tabIndex={0} onClick={onClick}>
        <div className={cls.chevron}>
          {open ? <IconChevronDown /> : <IconChevronRight />}
        </div>
        {name}
        {actions && <div className={cls.actions}>{actions}</div>}
      </div>
      <div className={cls.sub}>{children}</div>
    </div>
  );
};

export const Sidebar: React.FC<{
  org: ApiOrg;
  project?: ApiProject;
  children?: React.ReactElement;
}> = ({ org, project, children }) => {
  const location = useLocation();

  const linkOrg = useMemo(() => {
    return `/${org.id}/_`;
  }, [org]);
  const linkProject = useMemo(() => {
    return `/${org.id}/${project ? project.slug : ''}`;
  }, [org]);

  const [open, setOpen] = useState<string>('home');
  const [collapse, setCollapse] = useState<boolean>(false);

  useEffect(() => {
    const path = location.pathname.split('/');
    if (path[3] === 'settings') {
      setOpen('settings');
    } else {
      setOpen('home');
    }
  }, [location]);

  const onCollapse = () => {
    setCollapse(!collapse);
  };

  return (
    <div className={cls.wrapper}>
      <div className={classNames(cls.collapser, collapse && cls.collapsed)}>
        <Button
          size="small"
          icon={collapse ? <IconChevronRight /> : <IconChevronLeft />}
          type="ghost"
          onClick={onCollapse}
        />
      </div>
      <div className={classNames(cls.sidebar, collapse && cls.collapsed)}>
        <div className={cls.inner}>
          <div className={classNames(cls.header)}>
            <Link to={linkOrg}>
              <AvatarAuto
                name={org.name}
                size="default"
                shape="square"
                src={org.logo}
              />
            </Link>
            <div className={cls.label}>
              {!project && <Link to={`/${org.id}`}>{org.name}</Link>}
              {project && (
                <>
                  <span className={cls.slash}>/</span>
                  <Link to={linkProject}>{project.name}</Link>
                </>
              )}
            </div>
          </div>

          <div className={classNames(cls.content)}>
            {!project && (
              <Group name="Organisation">
                <Link
                  className={classNames(
                    cls.link,
                    open === 'home' && cls.selected
                  )}
                  to={`/${org.id}`}
                >
                  <span>
                    <IconHome />
                  </span>
                  Home
                </Link>
                <Link
                  className={classNames(
                    cls.link,
                    open === 'settings' && cls.selected
                  )}
                  to={`${linkOrg}/settings`}
                >
                  <span>
                    <IconSettings />
                  </span>
                  Settings
                </Link>
              </Group>
            )}
            {/* {project && (
        <div className={classNames(cls.group, cls.small)}>
          <Link className={cls.head} to={linkOrg}>
            <IconChevronLeft />
            Back to org
          </Link>
        </div>
      )} */}

            {project && <Staging />}

            {project && (
              <Group name="Project">
                <Link
                  className={classNames(
                    cls.link,
                    open === 'home' && cls.selected
                  )}
                  to={linkProject}
                >
                  <span>
                    <IconHome />
                  </span>
                  Home
                </Link>
                <Link
                  className={classNames(
                    cls.link,
                    open === 'settings' && cls.selected
                  )}
                  to={`${linkProject}/settings`}
                >
                  <span>
                    <IconSettings />
                  </span>
                  Settings
                </Link>
              </Group>
            )}

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
