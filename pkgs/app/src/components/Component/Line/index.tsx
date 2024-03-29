import { IconEyeOff, IconPlus } from '@tabler/icons-react';
import classnames from 'classnames';
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useClickAway } from 'react-use';

import type { ApiComponent } from '@specfy/models';

import { ComponentIcon } from '../Icon';
import { supportedIndexed } from '@/common/techs';
import { Button } from '@/components/Form/Button';
import type { RouteProject } from '@/types/routes';

import cls from './index.module.scss';

export interface Line {
  title: string;
  titlePlural?: string;
  params: RouteProject;
  editing?: boolean;
  children?: React.ReactNode;
}

/**
 * Display one component item (e.g: db, service, saas, etc.)
 */
export const ComponentItem: React.FC<{
  comp: ApiComponent;
  params: RouteProject;
  className?: string;
}> = ({ comp, params, className }) => {
  return (
    <Link
      key={comp.id}
      to={`/${comp.orgId}/${params.project_slug}/c/${comp.id}-${comp.slug}`}
    >
      <div className={classnames(cls.item, className)}>
        <div className={cls.icon}>
          <ComponentIcon data={comp} noEmpty />
        </div>
        <div className={cls.label}>{comp.name}</div>
      </div>
    </Link>
  );
};

/**
 * Display one tech item (e.g: language, tool)
 */
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

/**
 * Handle internal behavior, aka click to edit
 */
const InternalLine: React.FC<
  Line & {
    items?: React.ReactNode;
    count: number | null;
  }
> = ({ title, titlePlural, editing, children, items, count }) => {
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
      <div className={cls.title}>
        {count !== null && (
          <div style={{ fontSize: '22px', fontWeight: 500 }}>{count}</div>
        )}
        {titlePlural && count && count > 1 ? titlePlural : title}
      </div>
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

const VisibilityLine: React.FC<
  Line & {
    comps?: ApiComponent[];
    groups: { visible: ApiComponent[]; hidden: ApiComponent[] };
  }
> = ({ params, comps, groups }) => {
  const [show, setShow] = useState(false);

  if (comps && comps.length <= 0) {
    return <div className={cls.empty}>Empty</div>;
  }

  return (
    <div className={classnames(cls.values)}>
      {groups.visible.map((comp) => {
        return <ComponentItem comp={comp} params={params} key={comp.id} />;
      })}
      {groups.hidden.length > 0 && !show && (
        <Button
          size="l"
          onClick={() => setShow(true)}
          className={cls.hidden}
          display="ghost"
        >
          <IconEyeOff />
          {groups.hidden.length}
        </Button>
      )}

      {show && (
        <>
          {groups.hidden.map((comp) => {
            return <ComponentItem comp={comp} params={params} key={comp.id} />;
          })}
        </>
      )}
    </div>
  );
};

const TechVisibilityLine: React.FC<
  Line & { techs: ApiComponent['techs']; max?: number }
> = ({ params, techs, max = 9 }) => {
  const [show, setShow] = useState(false);
  const group = useMemo(() => {
    return { visible: techs.slice(0, max), hidden: techs.slice(max) };
  }, [techs]);

  return (
    <div className={classnames(cls.values)}>
      {group.visible.map((tech) => {
        return <TechItem key={tech.id} techId={tech.id} params={params} />;
      })}
      {group.hidden.length > 0 && !show && (
        <Button
          size="l"
          onClick={() => setShow(true)}
          className={cls.hidden}
          display="ghost"
        >
          <IconPlus />
          {group.hidden.length}
        </Button>
      )}

      {show && (
        <>
          {group.hidden.map((tech) => {
            return <TechItem key={tech.id} techId={tech.id} params={params} />;
          })}
        </>
      )}
    </div>
  );
};

/**
 * Display a line of technology (e.g: languages, tools, etc.)
 */
export const ComponentLineTech: React.FC<
  Line & {
    techs: ApiComponent['techs'];
    max?: number;
  }
> = (opts) => {
  return (
    <InternalLine
      {...opts}
      params={opts.params}
      count={null}
      items={<TechVisibilityLine {...opts} />}
    />
  );
};

/**
 * Display a line of components (e.g: services, databases, saas, etc.)
 */
export const ComponentLine: React.FC<
  Line & { comps?: ApiComponent[]; count?: boolean }
> = (opts) => {
  const groups = useMemo(() => {
    const tmp: { visible: ApiComponent[]; hidden: ApiComponent[] } = {
      visible: [],
      hidden: [],
    };
    if (!opts.comps) {
      return tmp;
    }

    for (const comp of opts.comps) {
      tmp[comp.show ? 'visible' : 'hidden'].push(comp);
    }

    return tmp;
  }, [opts.comps]);

  return (
    <InternalLine
      {...opts}
      params={opts.params}
      count={opts.count ? groups.visible.length : null}
      items={<VisibilityLine {...opts} groups={groups} />}
    />
  );
};
