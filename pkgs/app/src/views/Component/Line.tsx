import type { ApiComponent } from 'api/src/types/api/components';
import { Link } from 'react-router-dom';

import type { RouteProject } from '../../types/routes';

import cls from './index.module.scss';

export const Line: React.FC<{
  list: ApiComponent[];
  title: string;
  params: RouteProject;
}> = ({ list, title, params }) => {
  return (
    <div className={cls.line}>
      <div>{title}</div>
      <div>
        {list.map((c) => {
          return (
            <Link
              key={c.id}
              to={`/org/${params.org_id}/${params.project_slug}/c/${c.slug}`}
              className={cls.language}
            >
              <i className={`devicon-${c.name.toLocaleLowerCase()}-plain`}></i>{' '}
              {c.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
