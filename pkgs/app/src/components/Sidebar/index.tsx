import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconHome,
  IconSettings,
} from '@tabler/icons-react';
import type { ApiOrg, ApiProject } from 'api/src/types/api';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { AvatarAuto } from '../AvatarAuto';

import cls from './index.module.scss';

const Group: React.FC<{ children: React.ReactElement[]; name: string }> = ({
  children,
  name,
}) => {
  const [open, setOpen] = useState(true);
  const onClick = () => {
    setOpen(!open);
  };

  return (
    <div className={classNames(cls.group, !open && cls.hide)}>
      <div className={cls.head} role="button" tabIndex={0} onClick={onClick}>
        {open ? <IconChevronDown /> : <IconChevronRight />}
        {name}
      </div>
      <div className={cls.sub}>{children}</div>
    </div>
  );
};

export const Sidebar: React.FC<{
  org: ApiOrg;
  project?: ApiProject;
}> = ({ org, project }) => {
  const location = useLocation();

  const linkOrg = useMemo(() => {
    return `/${org.id}/_`;
  }, [org]);
  const linkProject = useMemo(() => {
    return `/${org.id}/${project ? project.slug : ''}`;
  }, [org]);

  const [open, setOpen] = useState<string>('home');

  useEffect(() => {
    const path = location.pathname.split('/');
    if (path[3] === 'settings') {
      setOpen('settings');
    } else {
      setOpen('home');
    }
  }, [location]);

  return (
    <div className={cls.sidebar}>
      <div className={classNames(cls.header, !project && cls.org)}>
        <AvatarAuto
          name={org.name}
          size="default"
          shape="square"
          src={org.logo}
        />
        <div className={cls.label}>
          <Link to={`/${org.id}`}>{org.name}</Link>
          {project && (
            <>
              <span className={cls.slash}>/</span>
              <Link to={linkProject}>{project.slug}</Link>
            </>
          )}
        </div>
      </div>

      {!project ? (
        <Group name="Organisation">
          <Link
            className={classNames(cls.link, open === 'home' && cls.selected)}
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
      ) : (
        <div className={cls.group}>
          <Link className={cls.head} to={linkOrg}>
            <IconChevronLeft />
            Back to org
          </Link>
        </div>
      )}

      {project && (
        <Group name="Project">
          <Link
            className={classNames(cls.link, open === 'home' && cls.selected)}
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
    </div>
  );
};
