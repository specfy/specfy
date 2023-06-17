import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import { Button } from 'antd';
import type { ApiOrg, ApiProject } from 'api/src/types/api';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

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
        {name}
        <div className={cls.chevron}>
          {open ? <IconChevronDown /> : <IconChevronRight />}
        </div>
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
  const linkOrg = useMemo(() => {
    return `/${org.id}/_`;
  }, [org]);
  const linkProject = useMemo(() => {
    return `/${org.id}/${project ? project.slug : ''}`;
  }, [org]);

  const [collapse, setCollapse] = useState<boolean>(false);

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
              <AvatarAuto size="large" org={org} className={cls.logo} />
            </Link>

            {!project && (
              <div className={cls.label}>
                <Link to={`/${org.id}`}>{org.name}</Link>
              </div>
            )}
            {project && (
              <div className={cls.project}>
                <Link className={cls.smallOrg} to={`/${org.id}`}>
                  {org.name}
                </Link>
                <div className={cls.label}>
                  <Link to={linkProject}>{project.name}</Link>
                </div>
              </div>
            )}
          </div>

          <div className={classNames(cls.content)}>
            {/* {project && (
              <div className={classNames(cls.group, cls.small)}>
                <Link className={cls.head} to={linkOrg}>
                  <IconChevronLeft />
                  Back to org
                </Link>
              </div>
            )} */}

            {project && <Staging showBadge={collapse} />}

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
