import { Typography } from 'antd';
import type { ApiComponent, BlockLevelZero } from 'api/src/types/api';
import classnames from 'classnames';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { supportedIndexed } from '../../common/component';
import originalStore, {
  useRevisionStore,
  useComponentsStore,
} from '../../common/store';
import type {
  ComponentBlobWithDiff,
  DiffObjectsArray,
} from '../../types/blobs';
import type { RouteProject } from '../../types/routes';
import { ComponentItem, TechItem } from '../ComponentLine';
import { ContentDoc } from '../Content';

import { Split } from './Split';
import { UnifiedDiff } from './Unified';
import { UnifiedContent } from './Unified/Content';
import cls from './index.module.scss';

export const DiffCardComponent: React.FC<{
  diff: ComponentBlobWithDiff;
}> = ({ diff }) => {
  const params = useParams<Partial<RouteProject>>() as RouteProject;
  const storeComponents = useComponentsStore();
  const storeRevision = useRevisionStore();
  const using = (diff.deleted ? diff.previous : diff.blob)!;

  const getComponent = (id: string): ApiComponent => {
    if (storeComponents.components[id]) {
      return storeComponents.components[id];
    }

    const inRevision = storeRevision.blobs.find((blob) => blob.typeId === id);
    if (inRevision) {
      return inRevision.deleted
        ? (inRevision.previous as ApiComponent)
        : (inRevision.blob as ApiComponent);
    }

    return originalStore.find(id)!;
  };

  const Title = useMemo(() => {
    const Icon =
      using.techId &&
      using.techId in supportedIndexed &&
      supportedIndexed[using.techId].Icon;
    const hasName = diff.diffs.find((d) => d.key === 'name');

    return (
      <Typography.Title level={4}>
        {Icon && (
          <div className={cls.icon}>
            <Icon />
          </div>
        )}
        {hasName && !diff.created ? (
          <UnifiedDiff key={hasName.key} diff={hasName} />
        ) : (
          using.name || ''
        )}
      </Typography.Title>
    );
  }, [diff]);

  if (diff.deleted || diff.created) {
    return (
      <div className={cls.content}>
        {Title}
        <Typography>
          <ContentDoc doc={using.description} id={diff.typeId} noPlaceholder />
        </Typography>
        {using.tech.length > 0 && (
          <div className={cls.line}>
            <Typography.Title level={4}>Stack</Typography.Title>
            <div className={cls.techs}>
              {using.tech?.map((techId) => {
                return (
                  <TechItem key={techId} techId={techId} params={params} />
                );
              })}
            </div>
          </div>
        )}

        {using.edges.length > 0 && (
          <div className={classnames(cls.line)}>
            <Typography.Title level={4}>Data</Typography.Title>
            <div className={classnames(cls.data)}>
              {using.edges.map((edge) => {
                const comp = getComponent(edge.to);
                return (
                  <div key={edge.to}>
                    Link to{' '}
                    <ComponentItem className={cls.item} techId={comp.techId}>
                      {comp.name}
                    </ComponentItem>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {using.inComponent &&
          (() => {
            const comp = getComponent(using.inComponent);
            return (
              <div className={classnames(cls.line)}>
                <Typography.Title level={4}>Host</Typography.Title>
                <div className={cls.techs}>
                  <ComponentItem className={cls.item} techId={comp.techId}>
                    {comp.name}
                  </ComponentItem>
                </div>
              </div>
            );
          })()}
      </div>
    );
  }

  return (
    <div className={cls.content}>
      {Title}
      {diff.diffs.map((d) => {
        if (d.key === 'name') {
          return null;
        }

        if (d.key === 'description') {
          return (
            <UnifiedContent
              key={d.key}
              doc={d.diff as unknown as BlockLevelZero}
              id={diff.typeId}
            />
          );
        }

        if (d.key === 'display') {
          return <div key={d.key}></div>;
        }

        if (d.key === 'tech') {
          return (
            <div key={d.key} className={classnames(cls.line)}>
              <Typography.Title level={4}>Stack</Typography.Title>
              {(d.diff as DiffObjectsArray<ApiComponent['tech'][0]>).added.map(
                (tech) => {
                  const name =
                    tech in supportedIndexed
                      ? supportedIndexed[tech].name
                      : tech;
                  return (
                    <div key={tech} className={cls.added}>
                      <ComponentItem
                        className={cls.item}
                        key={tech}
                        techId={tech}
                      >
                        {name}
                      </ComponentItem>
                    </div>
                  );
                }
              )}
              {(
                d.diff as DiffObjectsArray<ApiComponent['tech'][0]>
              ).deleted.map((tech) => {
                const name =
                  tech in supportedIndexed ? supportedIndexed[tech].name : tech;
                return (
                  <div key={tech} className={cls.removed}>
                    <ComponentItem
                      className={cls.item}
                      key={tech}
                      techId={tech}
                    >
                      {name}
                    </ComponentItem>
                  </div>
                );
              })}
            </div>
          );
        }

        if (d.key === 'edges') {
          const change = d.diff as DiffObjectsArray<ApiComponent['edges'][0]>;
          return (
            <div key={d.key} className={classnames(cls.line)}>
              <Typography.Title level={4}>Data</Typography.Title>
              {change.added.map((edge) => {
                const comp = getComponent(edge.to);
                return (
                  <div key={edge.to} className={cls.added}>
                    Link to{' '}
                    <ComponentItem className={cls.item} techId={comp.techId}>
                      {comp.name}
                    </ComponentItem>
                  </div>
                );
              })}
              {change.deleted.map((edge) => {
                const comp = getComponent(edge.to);

                return (
                  <div key={edge.to} className={cls.removed}>
                    Link to{' '}
                    <ComponentItem className={cls.item} techId={comp.techId}>
                      {comp.name}
                    </ComponentItem>
                  </div>
                );
              })}
              {change.modified.map((edge) => {
                const comp = getComponent(edge.to);

                return (
                  <div key={edge.to}>
                    Link to{' '}
                    <ComponentItem className={cls.item} techId={comp.techId}>
                      {comp.name}
                    </ComponentItem>
                  </div>
                );
              })}
            </div>
          );
        }

        if (d.key === 'inComponent') {
          const newComp = using.inComponent && getComponent(using.inComponent);
          const oldComp =
            diff.previous?.inComponent &&
            getComponent(diff.previous.inComponent);
          return (
            <div key={d.key} className={classnames(cls.line)}>
              <Typography.Title level={4}>Host</Typography.Title>
              {newComp && (
                <div className={cls.added}>
                  <ComponentItem className={cls.item} techId={newComp.techId}>
                    {newComp.name}
                  </ComponentItem>
                </div>
              )}
              {oldComp && (
                <div className={cls.removed}>
                  <ComponentItem className={cls.item} techId={oldComp.techId}>
                    {oldComp.name}
                  </ComponentItem>
                </div>
              )}
            </div>
          );
        }

        return <Split key={d.key} diff={d} created={!diff.previous} />;
      })}
    </div>
  );
};
