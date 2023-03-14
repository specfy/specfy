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
      items={techs?.map((tech) => {
        const supp = tech in supportedIndexed ? supportedIndexed[tech] : null;
        const Icon = supp?.Icon;
        const slug = supp?.key || tech.toLocaleLowerCase();

        return (
          <Link
            key={tech}
            to={`/${params.org_id}/${params.project_slug}/t/${slug}`}
            className={cls.item}
          >
            {Icon && <Icon size="1em" />}
            {supp?.name || tech}
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
        const Icon =
          c.techId &&
          c.techId in supportedIndexed &&
          supportedIndexed[c.techId].Icon;

        return (
          <Link
            key={c.id}
            to={`/${params.org_id}/${params.project_slug}/c/${c.id}-${c.slug}`}
            className={cls.item}
          >
            {Icon && <Icon size="1em" />}
            {c.name}
          </Link>
        );
      })}
    />
  );
};
