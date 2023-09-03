import type { ApiComponent } from '@specfy/models';
import classnames from 'classnames';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClickAway } from 'react-use';

import type { RouteProject } from '../../../types/routes';
import { ComponentIcon } from '../Icon';

import cls from './index.module.scss';

import { supportedIndexed } from '@/common/techs';

export interface Line {
  title: string;
  params: RouteProject;
  editing?: boolean;
  children?: React.ReactElement;
}

export const ComponentItem: React.FC<{
  comp: ApiComponent;
  params: RouteProject;
  className?: string;
}> = ({ comp, className }) => {
  return (
    <Link
      key={comp.id}
      to={`/${comp.orgId}/${comp.projectId}/c/${comp.id}-${comp.slug}`}
    >
      <div className={classnames(cls.item, className)}>
        <ComponentIcon data={comp} noEmpty className={cls.icon} />
        <div className={cls.label}>{comp.name}</div>
      </div>
    </Link>
  );
};

export const TechItem: React.FC<{
  techId: string;
  params: RouteProject;
  className?: string;
}> = ({ techId, params, className }) => {
  const supp = techId in supportedIndexed ? supportedIndexed[techId] : null;
  const slug = supp?.key || techId.toLocaleLowerCase();

  return (
    <Link to={`/${params.org_id}/${params.project_slug}/t/${slug}`}>
      <div className={classnames(cls.item, className)}>
        <ComponentIcon data={{ techId }} noEmpty className={cls.icon} />
        <div className={cls.label}>{supp?.name || techId}</div>
      </div>
    </Link>
  );
};

const InternalLine: React.FC<
  Line & {
    items?: React.ReactElement[];
  }
> = ({ title, editing, children, items }) => {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useClickAway(ref, () => {
    setShow(false);
  });

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if ((e.target as HTMLDivElement).role !== 'textbox') {
      return;
    }
    setShow(true);
  };

  return (
    <div className={cls.line} ref={ref}>
      <div className={cls.title}>{title}</div>
      <div
        className={classnames(cls.values, editing && cls.clickToEdit)}
        onClick={handleClick}
        tabIndex={editing ? 0 : undefined}
        role={editing ? 'textbox' : undefined}
      >
        {!show && items}
        {show && children}
      </div>
    </div>
  );
};

export const ComponentLineTech: React.FC<
  Line & {
    techs: ApiComponent['techs'];
  }
> = ({ techs, params, ...rest }) => {
  return (
    <InternalLine
      {...rest}
      params={params}
      items={techs.map((tech) => {
        return <TechItem key={tech.id} techId={tech.id} params={params} />;
      })}
    />
  );
};

export const ComponentLine: React.FC<Line & { comps?: ApiComponent[] }> = ({
  comps,
  params,
  ...rest
}) => {
  return (
    <InternalLine
      {...rest}
      params={params}
      items={comps?.map((c) => {
        return (
          <Link
            key={c.id}
            to={`/${params.org_id}/${params.project_slug}/c/${c.id}-${c.slug}`}
          >
            <div className={classnames(cls.item)}>
              <div className={cls.icon}>
                <ComponentIcon data={c} noEmpty />
              </div>
              <div className={cls.label}>{c.name}</div>
            </div>
          </Link>
        );
      })}
    />
  );
};
