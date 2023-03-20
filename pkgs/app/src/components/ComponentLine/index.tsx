import type { ApiComponent } from 'api/src/types/api';
import classnames from 'classnames';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClickAway } from 'react-use';

import { supportedIndexed } from '../../common/component';
import type { RouteProject } from '../../types/routes';

import cls from './index.module.scss';

export interface Line {
  title: string;
  params: RouteProject;
  editing?: boolean;
  children?: React.ReactElement;
}

export const ComponentItem: React.FC<{
  techId?: keyof typeof supportedIndexed | null;
  children: React.ReactNode;
  className?: string;
}> = ({ children, techId, className }) => {
  const Icon =
    techId && techId in supportedIndexed && supportedIndexed[techId].Icon;
  return (
    <span className={classnames(cls.item, className)}>
      {Icon && <Icon size="1em" />}
      {children}
    </span>
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
        const supp =
          techId in supportedIndexed ? supportedIndexed[techId] : null;
        const slug = supp?.key || techId.toLocaleLowerCase();

        return (
          <Link
            key={techId}
            to={`/${params.org_id}/${params.project_slug}/t/${slug}`}
          >
            <ComponentItem techId={techId}>
              {supp?.name || techId}
            </ComponentItem>
          </Link>
        );
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
            <ComponentItem techId={c.techId}>{c.name}</ComponentItem>
          </Link>
        );
      })}
    />
  );
};
