import { flagRevisionApprovalEnabled } from '@specfy/api/src/models/revisions/constants';
import type {
  ApiProject,
  ApiRevision,
  ListRevisions,
} from '@specfy/api/src/types/api';
import {
  IconChevronRight,
  IconCircleXFilled,
  IconSearch,
} from '@tabler/icons-react';
import { Button, Input, Select, Table } from 'antd';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { useListRevisions } from '../../../../api';
import { titleSuffix } from '../../../../common/string';
import { Container } from '../../../../components/Container';
import { Flex } from '../../../../components/Flex';
import { Loading } from '../../../../components/Loading';
import { StatusTag } from '../../../../components/Revision/StatusTag';
import { Time } from '../../../../components/Time';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

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

        {list && (
          <Table
            rowKey="id"
            dataSource={list.data}
            pagination={{ position: ['bottomCenter'] }}
          >
            <Table.Column
              title={false}
              dataIndex="name"
              key="name"
              render={(_, item: ApiRevision) => {
                return (
                  <Flex justifyContent="space-between" className={cls.line}>
                    <div>
                      <Link
                        to={`/${params.org_id}/${params.project_slug}/revisions/${item.id}`}
                        relative="path"
                        className={cls.title}
                      >
                        {item.name}
                      </Link>
                      <div className={cls.subtitle}>
                        Opened <Time time={item.createdAt} />
                      </div>
                    </div>

                    <div>
                      <StatusTag
                        status={item.status}
                        locked={item.locked}
                        merged={item.merged}
                      />
                      <Link
                        to={`/${params.org_id}/${params.project_slug}/revisions/${item.id}`}
                        relative="path"
                        className={cls.title}
                      >
                        <IconChevronRight />
                      </Link>
                    </div>
                  </Flex>
                );
              }}
            />
          </Table>
        )}
      </Container.Left2Third>
    </Container>
  );
};
