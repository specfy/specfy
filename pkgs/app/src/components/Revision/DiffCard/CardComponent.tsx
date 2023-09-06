import type { ApiComponent, BlockLevelZero } from '@specfy/models';
import { IconArrowRight } from '@tabler/icons-react';
import classnames from 'classnames';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import type {
  ComponentBlobWithDiff,
  DiffObjectsArray,
} from '../../../types/blobs';
import type { RouteProject } from '../../../types/routes';
import { ComponentIcon } from '../../Component/Icon';
import { ComponentItem, TechItem } from '../../Component/Line';
import { ContentDoc, Presentation } from '../../Content';
import { Flex } from '../../Flex';
import { PreviewNode } from '../../Flow/CustomNode';

import { Split } from './Split';
import { UnifiedDiff } from './Unified';
import { UnifiedContent } from './Unified/Content';
import cls from './index.module.scss';

import { original, useRevisionStore, useComponentsStore } from '@/common/store';
import { supportedIndexed } from '@/common/techs';

export const DiffCardComponent: React.FC<{
  diff: ComponentBlobWithDiff;
}> = ({ diff }) => {
  const params = useParams<Partial<RouteProject>>() as RouteProject;
  const storeComponents = useComponentsStore();
  const storeRevision = useRevisionStore();
  const using = diff.blob.current;

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

    return original.find(id)!;
  };

  const Title = useMemo(() => {
    const hasName = diff.diffs.find((d) => d.key === 'name');

    return (
      <h4 className={cls.cardTitle}>
        <Flex gap="l">
          <ComponentIcon data={using} large noEmpty />
          {hasName && !diff.blob.created ? (
            <UnifiedDiff key={hasName.key} diff={hasName} />
          ) : (
            using.name || ''
          )}
        </Flex>
      </h4>
    );
  }, [diff]);

  if (diff.blob.deleted || diff.blob.created) {
    return (
      <div className={cls.content}>
        {Title}
        <Presentation>
          <ContentDoc
            doc={using.description}
            id={diff.blob.typeId}
            placeholder={false}
          />
        </Presentation>
        {using.techs.length > 0 && (
          <div className={cls.line}>
            <h4>Stack</h4>
            <div className={cls.techs}>
              {using.techs.map((techId) => {
                return (
                  <TechItem
                    key={techId.id}
                    techId={techId.id}
                    params={params}
                  />
                );
              })}
            </div>
          </div>
        )}

        {using.edges.length > 0 && (
          <div className={classnames(cls.line)}>
            <h4>Data</h4>
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

        {using.inComponent.id &&
          (() => {
            const comp = getComponent(using.inComponent.id);
            return (
              <div className={classnames(cls.line)}>
                <h4>Host</h4>
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
          const prev = diff.blob.previous!;
          return (
            <div key={d.key} className={classnames(cls.spaced)}>
              <h4>Display</h4>
              <Flex gap="2xl">
                <div style={{ paddingLeft: '70px' }} className={cls.removed}>
                  <PreviewNode
                    node={{
                      id: prev.id,
                      data: { ...prev, originalSize: prev.display.size },
                      positionAbsolute: prev.display.pos,
                      height: prev.display.size.height,
                      width: prev.display.size.width,
                    }}
                    info={true}
                  />
                </div>
                <div>
                  <IconArrowRight />
                </div>
                <div style={{ paddingLeft: '70px' }} className={cls.added}>
                  <PreviewNode
                    node={{
                      id: using.id,
                      data: { ...using, originalSize: using.display.size },
                      positionAbsolute: using.display.pos,
                      height: using.display.size.height,
                      width: using.display.size.width,
                    }}
                    info={true}
                  />
                </div>
              </Flex>
            </div>
          );
        }

        if (d.key === 'techId') {
          const prev = diff.blob.previous!;
          return (
            <div key={d.key} className={classnames(cls.spaced)}>
              <h4>Technology</h4>
              <Flex style={{ margin: '10px 0 0 0' }} gap="2xl">
                <Flex gap="l" className={cls.removed}>
                  <ComponentIcon data={prev} large />
                  {prev.techId && prev.techId in supportedIndexed
                    ? supportedIndexed[prev.techId].name
                    : ''}
                  {!prev.techId && 'Service'}
                </Flex>
                <div>
                  <IconArrowRight />
                </div>
                <Flex gap="l" className={cls.added}>
                  <ComponentIcon data={using} large noEmpty />
                  {using.techId && using.techId in supportedIndexed
                    ? supportedIndexed[using.techId].name
                    : ''}
                  {!using.techId && 'Service'}
                </Flex>
              </Flex>
            </div>
          );
        }

        if (d.key === 'techs') {
          return (
            <div key={d.key} className={classnames(cls.line)}>
              <h4>Stack</h4>
              {(d.diff as DiffObjectsArray<ApiComponent['techs'][0]>).added.map(
                (tech) => {
                  return (
                    <div key={tech.id} className={cls.added}>
                      <TechItem
                        className={cls.item}
                        techId={tech.id}
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
                  <div key={tech.id} className={cls.removed}>
                    <TechItem
                      className={cls.item}
                      techId={tech.id}
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
              <h4>Data</h4>
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
          const newComp =
            using.inComponent.id && getComponent(using.inComponent.id);
          const oldComp =
            diff.blob.previous?.inComponent.id &&
            getComponent(diff.blob.previous.inComponent.id);
          return (
            <div key={d.key} className={classnames(cls.spaced)}>
              <h4>Host</h4>
              <Flex style={{ margin: '10px 0 0 0' }} gap="2xl">
                {oldComp && (
                  <Flex gap="l" className={cls.removed}>
                    <ComponentItem
                      className={cls.item}
                      comp={oldComp}
                      params={params}
                    />
                  </Flex>
                )}
                <div>
                  <IconArrowRight />
                </div>
                {newComp && (
                  <Flex gap="l" className={cls.added}>
                    <ComponentItem
                      className={cls.item}
                      comp={newComp}
                      params={params}
                    />
                  </Flex>
                )}
              </Flex>
            </div>
          );
        }

        return <Split key={d.key} diff={d} created={!diff.blob.previous} />;
      })}
    </div>
  );
};
