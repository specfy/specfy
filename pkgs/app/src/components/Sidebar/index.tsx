import type { ApiOrg, ApiProject } from '@specfy/api/src/types/api';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { AvatarAuto } from '../AvatarAuto';
import { Button } from '../Form/Button';
import { Staging } from '../Project/Header/Staging';

import cls from './index.module.scss';

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
        <Button size="s" display="ghost" onClick={onCollapse}>
          {collapse ? <IconChevronRight /> : <IconChevronLeft />}
        </Button>
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
            {project && <Staging showBadge={collapse} />}

            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
