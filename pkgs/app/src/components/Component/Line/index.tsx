import type { ApiComponent } from '@specfy/api/src/types/api';
import classnames from 'classnames';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClickAway } from 'react-use';

import { supportedIndexed } from '../../../common/component';
import type { RouteProject } from '../../../types/routes';
import { ComponentIcon } from '../Icon';

import cls from './index.module.scss';

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
      <span className={classnames(cls.item, className)}>
        <ComponentIcon {...comp} label={comp.name} />
        {comp.name}
      </span>
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
      <span className={classnames(cls.item, className)}>
        <ComponentIcon techId={techId} />
        {supp?.name || techId}
      </span>
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

  useClickAway(ref, (e) => {
    if ((e.target as HTMLElement).closest('.ant-select-dropdown')) {
      return;
    }

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
      <div className={cls.label}>{title}</div>
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
    techs: string[] | null;
  }
> = ({ techs, params, ...rest }) => {
  return (
    <InternalLine
      {...rest}
      params={params}
      items={techs?.map((techId) => {
        return <TechItem key={techId} techId={techId} params={params} />;
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
            <span className={classnames(cls.item)}>
              <ComponentIcon {...c} label={c.name} />
              {c.name}
            </span>
          </Link>
        );
      })}
    />
  );
};
