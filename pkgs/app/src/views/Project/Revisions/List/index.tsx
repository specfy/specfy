import type {
  ApiProject,
  ApiRevisionList,
  ListRevisions,
} from '@specfy/models';
import {
  IconChevronRight,
  IconCircleXFilled,
  IconSearch,
} from '@tabler/icons-react';
import { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { useListRevisions } from '../../../../api';
import { AvatarAuto, AvatarGroup } from '../../../../components/AvatarAuto';
import { Container, ContainerChild } from '../../../../components/Container';
import { Empty } from '../../../../components/Empty';
import { Flex } from '../../../../components/Flex';
import { Button } from '../../../../components/Form/Button';
import { Input } from '../../../../components/Form/Input';
import type { SelectOption } from '../../../../components/Form/Select';
import { SelectFull } from '../../../../components/Form/Select';
import { Loading } from '../../../../components/Loading';
import { StatusTag } from '../../../../components/Revision/StatusTag';
import { Time } from '../../../../components/Time';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

import { titleSuffix } from '@/common/string';

const options: SelectOption[] = [
  { value: 'opened', label: 'Opened' },
  { value: 'waiting', label: 'Waiting' },
  // flagRevisionApprovalEnabled ? { value: 'approved', label: 'Approved' } : null,
  { value: 'merged', label: 'Merged' },
  { value: 'all', label: 'All' },
];

export const Row: React.FC<{
  item: ApiRevisionList;
}> = ({ item }) => {
  const authors = item.authors.length > 0 ? item.authors : null;
  return (
    <Flex justify="space-between" align="center">
      <div>
        <Flex align="center" gap="l">
          <div className={cls.title}>
            <Link to={item.url} relative="path">
              {item.name}
            </Link>
          </div>
        </Flex>
        <Flex className={cls.info} gap="m">
          <Time time={item.updatedAt} />
          {authors && (
            <>
              ·{' '}
              {authors.length > 1 && (
                <AvatarGroup>
                  {authors.map((user) => {
                    return <AvatarAuto key={user.id} user={user} size="s" />;
                  })}
                </AvatarGroup>
              )}
              {authors.length > 0 && authors.length < 1 && (
                <Flex gap="m">
                  <AvatarAuto key={authors[0].id} user={authors[0]} size="s" />
                  {authors[0].name}
                </Flex>
              )}
            </>
          )}
        </Flex>
      </div>
      <Flex gap="l">
        <StatusTag
          status={item.status}
          locked={item.locked}
          merged={item.merged}
        />

        <Link to={item.url} relative="path">
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

  const hasFilter = useMemo(() => {
    return search || filterStatus !== 'opened';
  }, [search, filterStatus]);

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
      <ContainerChild leftLarge>
        <Helmet title={`Revisions - ${proj.name} ${titleSuffix}`} />
        <div className={cls.searchWrapper}>
          <h2>Revisions</h2>
          <Flex gap="m">
            {loading && <Loading />}
            <SelectFull
              defaultValue={filterStatus}
              value={filterStatus}
              options={options}
              onValueChange={(v) => setFilterStatus(v as any)}
            />
            <Input
              before={<IconSearch />}
              onChange={handleInput}
              value={search}
              after={
                <button
                  onClick={handleReset}
                  title="Reset search filters..."
                  style={{
                    opacity: hasFilter ? 100 : 0,
                  }}
                >
                  <IconCircleXFilled />
                </button>
              }
              placeholder="Search..."
            />
          </Flex>
        </div>

        {!list && (
          <div className={cls.list}>
            {[1, 2, 3].map((i) => {
              return (
                <Flex
                  key={i}
                  className={cls.row}
                  justify="space-between"
                  align="center"
                >
                  <Skeleton width={200} />
                </Flex>
              );
            })}
          </div>
        )}

        {list && (
          <div className={cls.list}>
            {list.data.map((item) => {
              return (
                <div className={cls.row} key={item.id}>
                  <Row item={item} />
                </div>
              );
            })}
          </div>
        )}
        {list && list.data.length <= 0 && (
          <Empty
            search={search}
            action={
              hasFilter && <Button onClick={handleReset}>Reset filter</Button>
            }
          />
        )}
      </ContainerChild>
    </Container>
  );
};
