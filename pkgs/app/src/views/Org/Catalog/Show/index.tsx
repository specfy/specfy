import { internalTypeToText } from '@specfy/models/src/components/constants';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { Link, useParams } from 'react-router-dom';
import { Cell, Pie, PieChart } from 'recharts';

import type { ApiOrg, GetCatalog } from '@specfy/models';
import type { TechType } from '@specfy/stack-analyser';

import { useGetCatalog, useListCatalog, useListProjects } from '@/api';
import { titleSuffix } from '@/common/string';
import { AvatarAuto } from '@/components/AvatarAuto';
import { List } from '@/components/Catalog/List';
import { ComponentIcon } from '@/components/Component/Icon';
import { ComponentTag } from '@/components/Component/Tag';
import { ContainerChild } from '@/components/Container';
import { Flex } from '@/components/Flex';
import { NotFound } from '@/components/NotFound';
import { Tag } from '@/components/Tag';

import cls from './index.module.scss';

export const Sidebar: React.FC<{
  org: ApiOrg;
  data: GetCatalog['Success']['data'];
  totalProjects: number;
}> = ({ org, data, totalProjects }) => {
  const res = useListCatalog({ org_id: org.id, type: data.tech.type });

  return (
    <ContainerChild rightSmall padded>
      <div>
        <h5>Related in {internalTypeToText[data.tech.type]}</h5>
        <List
          org={org}
          data={res.data?.data.byName || []}
          totalProjects={totalProjects}
          size="s"
        />
      </div>
    </ContainerChild>
  );
};

export const OrgCatalogShow: React.FC<{ org: ApiOrg }> = ({ org }) => {
  const params = useParams();
  const res = useGetCatalog({ org_id: org.id, tech_id: params.tech_id! });
  const getProjects = useListProjects({ org_id: org.id });
  const [data, setData] = useState<GetCatalog['Success']['data']>();

  useEffect(() => {
    if (res.data) {
      setData(res.data.data);
    }
  }, [res.data]);
  const projects = useMemo(() => {
    return getProjects.data?.data;
  }, [getProjects.data]);

  const chart = useMemo(() => {
    if (!projects || !data) {
      return null;
    }

    const usedBy = data.byProject.length;
    const notUsedBy = projects.length - usedBy;
    const pct = Math.round((usedBy / projects.length) * 100);

    return {
      usedBy,
      notUsedBy,
      pct,
      dataset: [
        { key: 'usage', label: 'Used', count: usedBy, color: '#3e63dd' },
        { key: 'usage', label: 'Not used', count: notUsedBy, color: '#eee' },
      ],
    };
  }, [projects, data]);

  if (!data) {
    if (!res.isLoading) {
      return <NotFound />;
    }

    return (
      <>
        <ContainerChild left padded>
          <Flex column align="flex-start">
            <h5>Catalog</h5>
            <div style={{ width: '100%' }}>
              <Skeleton style={{ height: '20px', width: '100%' }} />
            </div>
          </Flex>
          <Skeleton count={3} />
        </ContainerChild>
      </>
    );
  }

  return (
    <>
      <Helmet title={`Catalog - ${org.name} ${titleSuffix}`} />
      <ContainerChild left padded>
        <Flex column align="flex-start">
          <Flex align="center" gap="l" grow>
            <div>
              <ComponentIcon
                data={{
                  name: data.tech.name,
                  techId: data.tech.key,
                  type: data.tech.key as TechType,
                }}
                large
                noEmpty
              />
            </div>
            <h2>{data.tech.name}</h2>
          </Flex>

          <Flex gap="m" align="flex-start">
            <ComponentTag type={data.tech.type} />
          </Flex>
        </Flex>

        <div className={classNames(cls.block, cls.chart)}>
          {chart && (
            <Flex gap="xl">
              <PieChart width={60} height={80}>
                <Pie
                  data={chart.dataset}
                  nameKey={'label'}
                  dataKey={'count'}
                  innerRadius={20}
                  outerRadius={30}
                  fill={'#3e63dd'}
                  startAngle={90}
                  endAngle={-270}
                  animationDuration={250}
                  animationBegin={0}
                >
                  {chart.dataset.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
              <div>
                <div className={cls.number}>{chart.pct}%</div>
                usage across {org.name}
              </div>
            </Flex>
          )}
        </div>

        <div className={cls.block}>
          <h4 className={cls.heading}>
            Used by{' '}
            {chart && (
              <Tag variant="light">
                <strong>{chart.usedBy}</strong>{' '}
                {chart.usedBy > 1 ? 'projects' : 'project'}
              </Tag>
            )}
          </h4>
          {!projects ? (
            <Skeleton />
          ) : (
            <Flex wrap="wrap" gap="l">
              {data.byProject.map((id) => {
                const proj = projects.find((p) => p.id === id);
                if (!proj) {
                  return null;
                }
                return (
                  <Link
                    key={id}
                    to={`/${proj.orgId}/${proj.slug}`}
                    className={cls.project}
                  >
                    <AvatarAuto name={proj.name} size="xs" shape="square" />
                    <div>{proj.name}</div>
                  </Link>
                );
              })}
            </Flex>
          )}
        </div>

        <div className={cls.block}>
          <h4 className={cls.heading}>
            Not used by{' '}
            {chart && (
              <Tag variant="light">
                <strong>{chart.notUsedBy}</strong>{' '}
                {chart.notUsedBy > 1 ? 'projects' : 'project'}
              </Tag>
            )}
          </h4>
          {!projects ? (
            <Skeleton />
          ) : (
            <Flex wrap="wrap" gap="l">
              {projects.map((proj) => {
                if (data.byProject.includes(proj.id)) {
                  return null;
                }
                return (
                  <Link
                    key={proj.id}
                    to={`/${proj.orgId}/${proj.slug}`}
                    className={cls.project}
                  >
                    <AvatarAuto name={proj.name} size="xs" shape="square" />
                    <div>{proj.name}</div>
                  </Link>
                );
              })}
            </Flex>
          )}
        </div>
      </ContainerChild>
      <Sidebar
        org={org}
        data={data}
        totalProjects={getProjects.data!.data.length}
      />
    </>
  );
};
