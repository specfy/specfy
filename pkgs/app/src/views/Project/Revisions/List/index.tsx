import { flagRevisionApprovalEnabled } from '@specfy/api/src/models/revisions/constants';
import type { ApiProject, ListRevisions } from '@specfy/api/src/types/api';
import {
  IconChevronRight,
  IconCircleXFilled,
  IconSearch,
} from '@tabler/icons-react';
import { Button, Input, Select, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { useListRevisions } from '../../../../api';
import { titleSuffix } from '../../../../common/string';
import { AvatarAuto, AvatarGroup } from '../../../../components/AvatarAuto';
import { Container } from '../../../../components/Container';
import { Flex } from '../../../../components/Flex';
import { Loading } from '../../../../components/Loading';
import { StatusTag } from '../../../../components/Revision/StatusTag';
import { Time } from '../../../../components/Time';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

const Row: React.FC<{
  item: ListRevisions['Success']['data'][0];
  params: RouteProject;
}> = ({ item, params }) => {
  const link = `/${params.org_id}/${params.project_slug}/revisions/${item.id}`;

  return (
    <Flex className={cls.row} justify="space-between" align="center">
      <div>
        <Flex align="center" gap="l">
          <div className={cls.title}>
            <Link to={link} relative="path">
              {item.name}
            </Link>
          </div>
        </Flex>
        <Flex className={cls.info} gap="m">
          <Time time={item.updatedAt} />·{' '}
          {item.authors.length > 1 && (
            <AvatarGroup>
              {item.authors.map((user) => {
                return (
                  <AvatarAuto
                    key={user.id}
                    name={user.name}
                    colored={false}
                    size="small"
                  />
                );
              })}
            </AvatarGroup>
          )}
          {item.authors.length > 0 && (
            <Flex gap="m">
              <AvatarAuto
                key={item.authors[0].id}
                name={item.authors[0].name}
                colored={false}
                size="small"
              />
              {item.authors[0].name}
            </Flex>
          )}
        </Flex>
      </div>
      <Flex gap="l">
        <StatusTag
          status={item.status}
          locked={item.locked}
          merged={item.merged}
        />

        <Link to={link} relative="path">
          <IconChevronRight />
        </Link>
      </Flex>
    </Flex>
  );
};

export const ProjectRevisionsList: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const [filterStatus, setFilterStatus] =
    useState<ListRevisions['Querystring']['status']>('opened');
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [list, setList] = useState<ListRevisions['Success']>();
  const [searchDebounced, setSearchDebounced] = useState<string>('');
  useDebounce(
    () => {
      setSearchDebounced(search);
      setLoading(false);
    },
    500,
    [search]
  );

  const res = useListRevisions({
    org_id: params.org_id,
    project_id: proj.id,
    status: filterStatus,
    search: searchDebounced,
  });

  useEffect(() => {
    setLoading(res.isLoading);
    if (!res.data) {
      return;
    }

    setList(res.data);
  }, [res.dataUpdatedAt]);

  // Handler
  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearch(e.target.value);
    setLoading(true);
  };
  const handleReset = () => {
    setSearch('');
    setFilterStatus('opened');
  };

  return (
    <Container noPadding>
      <Container.Left2Third>
        <Helmet title={`Revisions - ${proj.name} ${titleSuffix}`} />
        <div className={cls.searchWrapper}>
          <h2>Revisions</h2>
          <div className={cls.search}>
            {loading && <Loading />}
            <div>
              <Input
                prefix={<IconSearch />}
                onChange={handleInput}
                value={search}
                addonBefore={
                  <Select
                    defaultValue={filterStatus}
                    value={filterStatus}
                    style={{ width: 'calc(100px)' }}
                    onChange={setFilterStatus}
                  >
                    <Select.Option value="opened">Opened</Select.Option>
                    <Select.Option value="waiting">Waiting</Select.Option>
                    {flagRevisionApprovalEnabled && (
                      <Select.Option value="approved">Approved</Select.Option>
                    )}
                    <Select.Option value="merged">Merged</Select.Option>
                    <Select.Option value="all">All</Select.Option>
                  </Select>
                }
                suffix={
                  search || filterStatus !== 'opened' ? (
                    <Button
                      onClick={handleReset}
                      title="Reset search filters..."
                      type="text"
                      icon={<IconCircleXFilled />}
                    />
                  ) : (
                    <span className={cls.placeholderReset}></span>
                  )
                }
                placeholder="Search..."
              />
            </div>
          </div>
        </div>

        {!list && <Skeleton active title={false} />}

        {list && (
          <div className={cls.list}>
            {list.data.map((item) => {
              return <Row item={item} params={params} key={item.id} />;
            })}
          </div>
        )}
      </Container.Left2Third>
    </Container>
  );
};
