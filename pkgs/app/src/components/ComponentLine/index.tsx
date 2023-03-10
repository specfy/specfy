import type { ApiComponent } from 'api/src/types/api';
import classnames from 'classnames';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClickAway } from 'react-use';

import { supportedIndexed } from '../../common/component';
import type { RouteProject } from '../../types/routes';

import cls from './index.module.scss';

export const ComponentLineTech: React.FC<{
  techs: string[] | null;
  title: string;
  params: RouteProject;
  editing?: boolean;
  children?: React.ReactElement;
}> = ({ techs, title, params, editing, children }) => {
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
        {!show &&
          techs?.map((tech) => {
            const supp =
              tech in supportedIndexed ? supportedIndexed[tech] : null;
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
        {show && children}
      </div>
    </div>
  );
};

export const ComponentLine: React.FC<{
  comps?: ApiComponent[];
  title: string;
  params: RouteProject;
  editing?: boolean;
  children?: React.ReactElement;
}> = ({ comps, title, params, editing, children }) => {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useClickAway(ref, (e) => {
    if ((e.target as HTMLElement).closest('.ant-select-dropdown')) {
      console.log('a');

      return;
    }
    console.log('aho');

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
        {!show &&
          comps?.map((c) => {
            const Icon =
              c.slug in supportedIndexed && supportedIndexed[c.slug].Icon;
            return (
              <Link
                key={c.id}
                to={`/${params.org_id}/${params.project_slug}/c/${c.slug}`}
                className={cls.item}
              >
                {Icon && <Icon size="1em" />}
                {c.name}
              </Link>
            );
          })}
        {show && children}
      </div>
    </div>
  );
};
