import { internalTypeToText } from '@specfy/models/src/components/constants';
import classNames from 'classnames';
import { DateTime } from 'luxon';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { Link, useParams } from 'react-router-dom';
import { Area, AreaChart, Cell, Pie, PieChart, Tooltip, XAxis } from 'recharts';

import type { ApiOrg, ApiProjectList, GetCatalog } from '@specfy/models';
import type { TechType } from '@specfy/stack-analyser';

import {
  useGetCatalog,
  useGetCatalogUserActivities,
  useListCatalog,
  useListProjects,
} from '@/api';
import { titleSuffix } from '@/common/string';
import { AvatarAuto } from '@/components/AvatarAuto';
import { List } from '@/components/Catalog/List';
import { ComponentIcon } from '@/components/Component/Icon';
import { ComponentTag } from '@/components/Component/Tag';
import { ContainerChild } from '@/components/Container';
import { Flex } from '@/components/Flex';
import { NotFound } from '@/components/NotFound';
import { Tag } from '@/components/Tag';
import { Subdued } from '@/components/Text';

import cls from './index.module.scss';

type Chart = {
  usedBy: number;
  notUsedBy: number;
  pct: number;
  dataset: Array<{
    key: string;
    label: string;
    count: number;
    color: string;
  }>;
};

export const Sidebar: React.FC<{
  org: ApiOrg;
  data: GetCatalog['Success']['data'];
  totalProjects: number;
}> = ({ org, data, totalProjects }) => {
  const res = useListCatalog({ org_id: org.id, type: data.tech.type });

  return (
    <ContainerChild rightSmall padded>
      <div>
        <h5>Related in category {internalTypeToText[data.tech.type]}</h5>
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

const UserActivities: React.FC<{
  org: ApiOrg;
  tech: GetCatalog['Success']['data']['tech'];
}> = ({ org, tech }) => {
  const res = useGetCatalogUserActivities({
    org_id: org.id,
    tech_id: tech.key,
  });
  const data = res.data?.data;

  const histogram = useMemo(() => {
    if (!data?.histogram) {
      return [];
    }

    const startDate = new Date(Date.now() - 86400 * 90 * 1000);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date();
    const dates = [];
    while (startDate <= endDate) {
      dates.push(DateTime.fromJSDate(startDate).toFormat('LLL dd'));
      startDate.setDate(startDate.getDate() + 1);
    }

    const tmp = [];
    const map = new Map<string, number>();
    for (const entry of data.histogram) {
      map.set(DateTime.fromMillis(entry.date).toFormat('LLL dd'), entry.count);
    }
    for (const date of dates) {
      tmp.push({ date, count: map.get(date) || 0 });
    }

    return tmp;
  }, [data]);

  if (!data) {
    return;
  }

  return (
    <div className={cls.section}>
      <div className={cls.block}>
        <div className={cls.grid}>
          <div>
            <h3 className={cls.heading}>
              User Activities <Tag variant="light">90d</Tag>
            </h3>

            <div className={cls.metric}>
              <div className={cls.number}>{data.users.length}</div>
              <div className={cls.label}>users pushed code</div>
            </div>
          </div>
          <Flex style={{ width: '100%', height: '100%' }} justify="flex-end">
            <AreaChart height={80} width={250} data={histogram}>
              <XAxis
                dataKey="date"
                interval={'preserveStartEnd'}
                tickLine={false}
                minTickGap={75}
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3e63dd"
                fill="#ccd8ff"
                strokeWidth={2}
                animationDuration={250}
                animationBegin={0}
              />
            </AreaChart>
          </Flex>
        </div>

        <div>
          <table className={cls.table}>
            <tbody>
              {data.users.map((user) => {
                return (
                  <tr
                    key={
                      user.type === 'guest' ? user.username : user.profile.id
                    }
                  >
                    <td>
                      {user.type === 'guest' ? (
                        <div key={user.username} className={cls.user}>
                          <AvatarAuto
                            name={user.username}
                            shape="circle"
                            size="s"
                          />
                          {user.username}
                        </div>
                      ) : (
                        <div key={user.profile.id} className={cls.user}>
                          <AvatarAuto
                            user={user.profile}
                            shape="circle"
                            size="s"
                          />
                          {user.profile.name}
                        </div>
                      )}
                    </td>
                    <td className={cls.tdCount}>{user.count} activities</td>
                    <td className={cls.tdScore}>
                      <div
                        className={classNames(cls.scoreCard, cls[user.trend])}
                      >
                        <div className={cls.score}>{user.score}</div>
                        <div className={cls.scoreLabel}>
                          {user.trend === 'bad'
                            ? 'Not active'
                            : user.trend === 'warn'
                            ? 'Engaged'
                            : 'Active'}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const Projects: React.FC<{
  projects?: ApiProjectList[];
  data: GetCatalog['Success']['data'];
}> = ({ projects, data }) => {
  const [using, notusing] = useMemo<
    [ApiProjectList[], ApiProjectList[]]
  >(() => {
    const a: ApiProjectList[] = [];
    const b: ApiProjectList[] = [];

    if (projects) {
      for (const project of projects) {
        if (data.byProject.includes(project.id)) {
          a.push(project);
        } else {
          b.push(project);
        }
      }
    }

    return [a, b];
  }, [data, projects]);

  return (
    <div className={cls.section}>
      <h3 className={cls.heading}>Projects</h3>
      <div className={cls.grid}>
        <div className={cls.block}>
          <div className={cls.metric}>
            <div className={cls.number}>{using.length}</div>
            <div className={cls.label}>using</div>
          </div>
          {!projects ? (
            <Skeleton />
          ) : (
            <Flex wrap="wrap" gap="m">
              {using.map((proj) => {
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
              {using.length <= 0 && <Subdued>Nothing to show.</Subdued>}
            </Flex>
          )}
        </div>

        <div className={cls.block}>
          <div className={cls.metric}>
            <div className={cls.number}>{notusing.length}</div>
            <div className={cls.label}>not using</div>
          </div>

          {!projects ? (
            <Skeleton />
          ) : (
            <Flex wrap="wrap" gap="m">
              {notusing.map((proj) => {
                return (
                  <Link
                    key={proj.id}
                    to={`/${proj.orgId}/${proj.slug}`}
                    className={classNames(cls.project, cls.subdued)}
                  >
                    <AvatarAuto name={proj.name} size="xs" shape="square" />
                    <div>{proj.name}</div>
                  </Link>
                );
              })}
              {notusing.length <= 0 && <Subdued>Nothing to show.</Subdued>}
            </Flex>
          )}
        </div>
      </div>
    </div>
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

  const chart = useMemo<Chart | null>(() => {
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
            <div>
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
                  <div className={cls.label}>Usage across {org.name}</div>
                </div>
              </Flex>
            </div>
          )}
        </div>

        <Projects projects={projects} data={data} />

        <UserActivities org={org} tech={data.tech}></UserActivities>
      </ContainerChild>
      <Sidebar org={org} data={data} totalProjects={projects?.length || 0} />
    </>
  );
};
