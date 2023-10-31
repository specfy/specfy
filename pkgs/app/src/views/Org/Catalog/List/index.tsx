import { internalTypeToText } from '@specfy/models/src/components/constants';
import { IconPlus } from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Tooltip } from 'recharts';

import type {
  ApiOrg,
  CatalogItem,
  ComponentType,
  ListCatalog,
} from '@specfy/models';

import { useListProjects, useListCatalog } from '@/api';
import { qcli } from '@/common/query';
import { titleSuffix } from '@/common/string';
import { supportedIndexed } from '@/common/techs';
import { List } from '@/components/Catalog/List';
import { ContainerChild } from '@/components/Container';
import { Empty } from '@/components/Empty';
import { Flex } from '@/components/Flex';
import { Button } from '@/components/Form/Button';
import { Loading } from '@/components/Loading';
import { Tag } from '@/components/Tag';
import { useEventBus } from '@/hooks/useEventBus';

import cls from './index.module.scss';

const filtersBase: Array<{ label: string; value: string; count: 0 }> = [
  { label: 'All', value: 'all', count: 0 },
  { label: 'Analytics', value: 'analytics', count: 0 },
  { label: 'API', value: 'api', count: 0 },
  { label: 'Application', value: 'app', count: 0 },
  { label: 'CI', value: 'ci', count: 0 },
  { label: 'Cloud', value: 'cloud', count: 0 },
  { label: 'Database', value: 'db', count: 0 },
  { label: 'ETL', value: 'etl', count: 0 },
  { label: 'Framework', value: 'framework', count: 0 },
  { label: 'Hosting & Compute', value: 'hosting', count: 0 },
  { label: 'Language', value: 'language', count: 0 },
  { label: 'Monitoring', value: 'monitoring', count: 0 },
  { label: 'Tool', value: 'tool', count: 0 },
  { label: 'Queue', value: 'messaging', count: 0 },
  { label: 'SaaS', value: 'saas', count: 0 },
  { label: 'Storage', value: 'storage', count: 0 },
  { label: 'Other', value: 'unknown', count: 0 },
];

export const OrgCatalogList: React.FC<{ org: ApiOrg }> = ({ org }) => {
  const [rawFilter, setRawFilter] =
    useState<ListCatalog['Querystring']['type']>('all');
  const res = useListCatalog({ org_id: org.id, type: rawFilter });
  const getProjects = useListProjects({ org_id: org.id });
  const [totalProjects, setTotalProjects] = useState(0);
  const [categories, setCategories] = useState<CatalogItem[]>([]);
  const [data, setData] = useState<CatalogItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [ready, setReady] = useState<boolean>(false);
  const [indexing, setIndexing] = useState<boolean>(false);

  useEffect(() => {
    setTotalProjects(getProjects.data?.pagination.totalItems || 0);
  }, [getProjects.data]);

  useEffect(() => {
    if (!res.data) {
      return;
    }

    if (res.data.data.byType) {
      setCategories(
        res.data.data.byType.sort((a, b) => {
          return a.count > b.count ? -1 : 1;
        })
      );
      setTotal(res.data.data.byName.length);
    }
    setData(res.data.data.byName);
    setReady(true);
  }, [res.data]);

  const filters = useMemo(() => {
    if (!res.data || categories.length === 0) {
      return null;
    }

    return filtersBase.map((filter) => {
      const cat = categories.find((c) => c.key === filter.value);
      return {
        ...filter,
        count: cat ? cat.count : filter.value === 'all' ? total : 0,
      };
    });
  }, [filtersBase, categories, data]);

  const chart = useMemo<{
    unique: number;
    dataset: Array<{ key: string; label: string; count: number }>;
  }>(() => {
    if (rawFilter === 'all') {
      return {
        unique: categories.length,
        dataset: categories.map((cat) => {
          return {
            ...cat,
            label: internalTypeToText[cat.key as unknown as ComponentType],
          };
        }),
      };
    }

    if (!data) {
      return { unique: 0, dataset: [] };
    }

    return {
      unique: data.length,
      dataset: data.map((cat) => {
        if (!(cat.key in supportedIndexed)) {
          return {
            ...cat,
            label: cat.key,
          };
        }

        return {
          ...cat,
          label: supportedIndexed[cat.key].name,
        };
      }),
    };
  }, [rawFilter, data]);

  useEventBus(
    'job.start',
    (evt) => {
      if (
        evt.job.orgId === org.id &&
        (evt.job.type === 'projectIndex' || evt.job.type === 'backfillGithub')
      ) {
        setIndexing(true);
      }
    },
    [org]
  );
  useEventBus(
    'job.finish',
    (evt) => {
      if (
        evt.job.orgId === org.id &&
        (evt.job.type === 'projectIndex' || evt.job.type === 'backfillGithub')
      ) {
        void qcli.refetchQueries(['listCatalog', org.id]);
        void qcli.refetchQueries(['getCatalog', org.id]);
        void qcli.refetchQueries(['getUserActivities', org.id]);
        setIndexing(false);
      }
    },
    [org]
  );

  if (!ready) {
    return (
      <>
        <Helmet title={`Catalog - ${org.name} ${titleSuffix}`} />
        <ContainerChild left padded>
          <h2>Catalog</h2>
          <Skeleton count={2} />
          <List data={[]} totalProjects={0} org={org} />
        </ContainerChild>
        <ContainerChild rightSmall padded>
          <Skeleton count={2} />
        </ContainerChild>
      </>
    );
  }
  if (ready && data.length <= 0 && !filters) {
    return (
      <>
        <Helmet title={`Catalog - ${org.name} ${titleSuffix}`} />
        <ContainerChild left padded>
          <h2>Catalog</h2>
          <Empty
            title="Catalog is empty"
            desc="Create a project manually or from GitHub."
            action={
              <Flex column gap="xl">
                <Link to={`/${org.id}/_/project/new`}>
                  <Button display="primary">
                    <IconPlus /> Create a new Project
                  </Button>
                </Link>
              </Flex>
            }
          />
        </ContainerChild>
      </>
    );
  }

  return (
    <>
      <Helmet title={`Catalog - ${org.name} ${titleSuffix}`} />
      <ContainerChild left padded>
        <Flex justify="space-between">
          <h2>Catalog {res.isLoading && <Loading />}</h2>
          <div>
            {indexing && (
              <Flex gap="m">
                <Loading /> indexing
              </Flex>
            )}
          </div>
        </Flex>

        <Flex gap="m" align="flex-start" wrap="wrap">
          {filters &&
            filters.map((cat) => {
              const sel = rawFilter === cat.value;
              return (
                <Button
                  key={cat.value}
                  size="xs"
                  display={sel ? 'primary' : 'default'}
                  onClick={() => setRawFilter(cat.value as any)}
                >
                  {cat.label}
                  {cat.count > 0 && (
                    <Tag variant={sel ? 'reverse' : 'border'} size="xs">
                      {cat.count}
                    </Tag>
                  )}
                </Button>
              );
            })}
        </Flex>
        {res.data && (
          <List data={data} totalProjects={totalProjects} org={org} />
        )}
      </ContainerChild>
      <ContainerChild rightSmall className={cls.sidebar}>
        <div className={cls.block}>
          <Flex gap="m">
            <div>
              <PieChart width={80} height={100}>
                <Pie
                  data={chart.dataset}
                  nameKey={'label'}
                  dataKey={'count'}
                  innerRadius={20}
                  outerRadius={30}
                  fill="#3e63dd"
                  startAngle={-90}
                  animationDuration={250}
                  animationBegin={0}
                />
                <Tooltip
                  animationDuration={0}
                  wrapperClassName={cls.tooltip}
                  position={{ x: 80, y: 0 }}
                />
              </PieChart>
            </div>

            <div>
              Across {totalProjects} projects
              <br />
              {rawFilter === 'all' ? (
                <>
                  <strong>{total} entries</strong> distributed in{' '}
                  <strong>{categories.length} categories</strong>
                </>
              ) : (
                <>
                  <strong>{chart.unique} entries</strong> in{' '}
                  <strong>{internalTypeToText[rawFilter]}</strong>
                </>
              )}
            </div>
          </Flex>
        </div>
      </ContainerChild>
    </>
  );
};
