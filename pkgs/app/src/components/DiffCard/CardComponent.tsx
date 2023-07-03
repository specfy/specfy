import type { ApiComponent, BlockLevelZero } from '@specfy/api/src/types/api';
import { Typography } from 'antd';
import classnames from 'classnames';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import originalStore, {
  useRevisionStore,
  useComponentsStore,
} from '../../common/store';
import type {
  ComponentBlobWithDiff,
  DiffObjectsArray,
} from '../../types/blobs';
import type { RouteProject } from '../../types/routes';
import { ComponentIcon } from '../Component/Icon';
import { ComponentItem, TechItem } from '../Component/Line';
import { ContentDoc } from '../Content';
import { Flex } from '../Flex';

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
  const using = (diff.blob.deleted ? diff.blob.previous : diff.blob.current)!;

  const getComponent = (id: string): ApiComponent => {
    if (storeComponents.components[id]) {
      return storeComponents.components[id];
    }

    const inRevision = storeRevision.blobs.find((blob) => blob.typeId === id);
    if (inRevision) {
      return inRevision.deleted
        ? (inRevision.previous as ApiComponent)
        : (inRevision.current as ApiComponent);
    }

    return originalStore.find(id)!;
  };

  const Title = useMemo(() => {
    const hasName = diff.diffs.find((d) => d.key === 'name');

    return (
      <Typography.Title level={4}>
        <Flex gap="l">
          <ComponentIcon {...using} label={using.name} large />
          {hasName && !diff.blob.created ? (
            <UnifiedDiff key={hasName.key} diff={hasName} />
          ) : (
            using.name || ''
          )}
        </Flex>
      </Typography.Title>
    );
  }, [diff]);

  if (diff.blob.deleted || diff.blob.created) {
    return (
      <div className={cls.content}>
        {Title}
        <Typography>
          <ContentDoc
            doc={using.description}
            id={diff.blob.typeId}
            noPlaceholder
          />
        </Typography>
        {using.techs.length > 0 && (
          <div className={cls.line}>
            <Typography.Title level={4}>Stack</Typography.Title>
            <div className={cls.techs}>
              {using.techs?.map((techId) => {
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
                const comp = getComponent(edge.target);
                return (
                  <div key={edge.target}>
                    Link to{' '}
                    <ComponentItem
                      className={cls.item}
                      comp={comp}
                      params={params}
                    />
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
                  <ComponentItem
                    className={cls.item}
                    comp={comp}
                    params={params}
                  />
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
              id={diff.blob.typeId}
            />
          );
        }

        if (d.key === 'display') {
          return <div key={d.key}></div>;
        }

        if (d.key === 'techs') {
          return (
            <div key={d.key} className={classnames(cls.line)}>
              <Typography.Title level={4}>Stack</Typography.Title>
              {(d.diff as DiffObjectsArray<ApiComponent['techs'][0]>).added.map(
                (tech) => {
                  return (
                    <div key={tech} className={cls.added}>
                      <TechItem
                        className={cls.item}
                        key={tech}
                        techId={tech}
                        params={params}
                      />
                    </div>
                  );
                }
              )}
              {(
                d.diff as DiffObjectsArray<ApiComponent['techs'][0]>
              ).deleted.map((tech) => {
                return (
                  <div key={tech} className={cls.removed}>
                    <TechItem
                      className={cls.item}
                      key={tech}
                      techId={tech}
                      params={params}
                    />
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
                const comp = getComponent(edge.target);
                return (
                  <div key={edge.target} className={cls.added}>
                    Link to{' '}
                    <ComponentItem
                      className={cls.item}
                      comp={comp}
                      params={params}
                    />
                  </div>
                );
              })}
              {change.deleted.map((edge) => {
                const comp = getComponent(edge.target);

                return (
                  <div key={edge.target} className={cls.removed}>
                    Link to{' '}
                    <ComponentItem
                      className={cls.item}
                      comp={comp}
                      params={params}
                    />
                  </div>
                );
              })}
              {change.modified.map((edge) => {
                const comp = getComponent(edge.target);

                return (
                  <div key={edge.target}>
                    Link to{' '}
                    <ComponentItem
                      className={cls.item}
                      comp={comp}
                      params={params}
                    />
                  </div>
                );
              })}
            </div>
          );
        }

        if (d.key === 'inComponent') {
          const newComp = using.inComponent && getComponent(using.inComponent);
          const oldComp =
            diff.blob.previous?.inComponent &&
            getComponent(diff.blob.previous.inComponent);
          return (
            <div key={d.key} className={classnames(cls.line)}>
              <Typography.Title level={4}>Host</Typography.Title>
              {newComp && (
                <div className={cls.added}>
                  <ComponentItem
                    className={cls.item}
                    comp={newComp}
                    params={params}
                  />
                </div>
              )}
              {oldComp && (
                <div className={cls.removed}>
                  <ComponentItem
                    className={cls.item}
                    comp={oldComp}
                    params={params}
                  />
                </div>
              )}
            </div>
          );
        }

        return <Split key={d.key} diff={d} created={!diff.blob.previous} />;
      })}
    </div>
  );
};
