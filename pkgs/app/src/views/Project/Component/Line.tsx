import type { ApiComponent } from 'api/src/types/api/components';
import { Link } from 'react-router-dom';

import { supported } from '../../../common/component';
import type { RouteProject } from '../../../types/routes';

import cls from './index.module.scss';

export const Line: React.FC<{
  comps?: ApiComponent[];
  techs?: string[];
  title: string;
  params: RouteProject;
}> = ({ comps, techs, title, params }) => {
  return (
    <div className={cls.line}>
      <div className={cls.label}>{title}</div>
      <div className={cls.values}>
        {techs?.map((tech) => {
          const name = tech.toLocaleLowerCase();
          const Icon = tech in supported && supported[tech].Icon;
          return (
            <Link
              key={tech}
              to={`/org/${params.org_id}/${params.project_slug}/t/${name}`}
              className={cls.item}
            >
              {Icon && <Icon size="1em" />}
              {tech}
            </Link>
          );
        })}
        {comps?.map((c) => {
          const Icon = c.name in supported && supported[c.name].Icon;
          return (
            <Link
              key={c.id}
              to={`/org/${params.org_id}/${params.project_slug}/c/${c.slug}`}
              className={cls.item}
            >
              {Icon && <Icon size="1em" />}
              {c.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
