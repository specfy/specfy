import { Typography } from 'antd';
import type { ApiComponent } from 'api/src/types/api/components';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import cls from './index.module.scss';

export const TechnicalAspects: React.FC<{
  components: ApiComponent[];
  orgId: string;
  slug: string;
}> = ({ components, orgId, slug }) => {
  const [hosts, setHosts] = useState<ApiComponent[]>([]);
  const [techs, setTechs] = useState<Array<[string, string]>>([]);
  const [tp, setTP] = useState<ApiComponent[]>([]);
  const [projects, setProjects] = useState<ApiComponent[]>([]);

  useEffect(() => {
    const _techs = new Map<string, string>();
    const _hosts = [];
    const _tp = [];
    const _projects = [];

    for (const comp of components) {
      if (comp.type === 'hosting') {
        _hosts.push(comp);
      } else if (comp.type === 'thirdparty') {
        _tp.push(comp);
      } else if (comp.type === 'project') {
        _projects.push(comp);
      }
      if (comp.tech) {
        for (const t of comp.tech) {
          _techs.set(t, t.toLocaleLowerCase());
        }
      }
    }

    setTechs(Array.from(_techs.entries()));
    setHosts(_hosts);
    setTP(_tp);
    setProjects(_projects);
  }, [components]);

  return (
    <>
      {techs.length <= 0 &&
        components.length <= 0 &&
        tp.length <= 0 &&
        projects.length <= 0 && (
          <Typography.Text type="secondary">Nothing to show.</Typography.Text>
        )}

      {techs.length > 0 && (
        <div className={cls.line}>
          <div>Stack</div>
          <div>
            {hosts.map((comp) => {
              return (
                <span key={comp.id} className={cls.comp}>
                  <Link to={`/org/${orgId}/${slug}/c/${comp.slug}`}>
                    {comp.name}
                  </Link>
                </span>
              );
            })}
            {techs.map((tech) => {
              return (
                <span key={tech[1]} className={cls.comp}>
                  <Link to={`/org/${orgId}/${slug}/t/${tech[1]}`}>
                    {tech[0]}
                  </Link>
                </span>
              );
            })}
          </div>
        </div>
      )}
      {components.length > 0 && (
        <div className={cls.line}>
          <div>Components</div>
          <div>
            {components.map((comp) => {
              if (comp.type !== 'component') {
                return null;
              }
              return (
                <span key={comp.id} className={cls.comp}>
                  <Link
                    key={comp.id}
                    to={`/org/${orgId}/${slug}/c/${comp.slug}`}
                  >
                    {comp.name}
                  </Link>
                </span>
              );
            })}
          </div>
        </div>
      )}
      {tp.length > 0 && (
        <div className={cls.line}>
          <div>Third Parties</div>
          <div>
            {tp.map((comp) => {
              return (
                <span key={comp.id} className={cls.comp}>
                  <Link
                    key={comp.id}
                    to={`/org/${orgId}/${slug}/c/${comp.slug}`}
                  >
                    {comp.name}
                  </Link>
                </span>
              );
            })}
          </div>
        </div>
      )}
      {projects.length > 0 && (
        <div className={cls.line}>
          <div>Depends on projects</div>
          <div>
            {projects.map((comp) => {
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
      )}
    </>
  );
};
