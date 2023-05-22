import { IconHome, IconSettings } from '@tabler/icons-react';
import type { ApiOrg, ApiProject } from 'api/src/types/api';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { AvatarAuto } from '../AvatarAuto';

import cls from './index.module.scss';

export const Sidebar: React.FC<{
  org: ApiOrg;
  project?: ApiProject;
}> = ({ org, project }) => {
  const location = useLocation();

  const linkSelf = useMemo(() => {
    return `/${org.id}/_`;
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
              <Link to={`/${org.id}/${project.slug}`}>{project.slug}</Link>
            </>
          )}
        </div>
      </div>

      <div className={cls.group}>
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
          className={classNames(cls.link, open === 'settings' && cls.selected)}
          to={`${linkSelf}/settings`}
        >
          <span>
            <IconSettings />
          </span>
          Settings
        </Link>
      </div>
    </div>
  );
};
