import type { ApiComponent } from 'api/src/types/api/components';
import { Link } from 'react-router-dom';

import cls from './index.module.scss';

export const TechnicalAspects: React.FC<{
  components: ApiComponent[];
  orgId: string;
  slug: string;
}> = ({ components, orgId, slug }) => {
  return (
    <>
      <div className={cls.line}>
        <div>Stack</div>
        <div>
          {components.map((comp) => {
            if (comp.type !== 'hosting') {
              return null;
            }
            return (
              <span key={comp.id} className={cls.comp}>
                <Link to={`/org/${orgId}/${slug}/c/${comp.slug}`}>
                  {comp.name}
                </Link>
              </span>
            );
          })}
          {components.map((comp) => {
            return comp.tech?.map((tech) => {
              return (
                <span key={comp.id} className={cls.comp}>
                  <Link to={`/org/${orgId}/t/${tech}`}>{tech}</Link>
                </span>
              );
            });
          })}
        </div>
      </div>
      <div className={cls.line}>
        <div>Components</div>
        <div>
          {components.map((comp) => {
            if (comp.type !== 'component') return null;
            return (
              <span key={comp.id} className={cls.comp}>
                <Link key={comp.id} to={`/org/${orgId}/${slug}/c/${comp.slug}`}>
                  {comp.name}
                </Link>
              </span>
            );
          })}
        </div>
      </div>
      <div className={cls.line}>
        <div>Third Parties</div>
        <div>
          {components.map((comp) => {
            if (comp.type !== 'thirdparty') return null;
            return (
              <span key={comp.id} className={cls.comp}>
                <Link key={comp.id} to={`/org/${orgId}/${slug}/c/${comp.slug}`}>
                  {comp.name}
                </Link>
              </span>
            );
          })}
        </div>
      </div>
      <div className={cls.line}>
        <div>Link to Project</div>
        <div>
          {components.map((comp) => {
            if (comp.type !== 'project') return null;
            return (
              <span key={comp.id} className={cls.comp}>
                <Link to={`/org/${orgId}/${slug}/c/${comp.slug}`}>
                  {comp.name}
                </Link>
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
};
