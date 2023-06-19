import { LoadingOutlined } from '@ant-design/icons';
import { IconCircleX, IconHistory, IconSearch } from '@tabler/icons-react';
import { Button, Input, Select, Table } from 'antd';
import type {
  ApiProject,
  ApiRevision,
  ReqListRevisions,
  ResListRevisionsSuccess,
} from 'api/src/types/api';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { useListRevisions } from '../../../../api';
import { titleSuffix } from '../../../../common/string';
import { Card } from '../../../../components/Card';
import { Container } from '../../../../components/Container';
import { StatusTag } from '../../../../components/StatusTag';
import { Time } from '../../../../components/Time';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

export const ProjectRevisionsList: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const [filterStatus, setFilterStatus] =
    useState<ReqListRevisions['status']>('opened');
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [list, setList] = useState<ResListRevisionsSuccess>();
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
    <Container className={cls.container}>
      <Helmet title={`Revisions - ${proj.name} ${titleSuffix}`} />
      <div className={cls.searchWrapper}>
        <div className={cls.search}>
          <div className={cls.inputs}>
            <Input
              size="large"
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
                  <Select.Option value="approved">Approved</Select.Option>
                  <Select.Option value="merged">Merged</Select.Option>
                  <Select.Option value="all">All</Select.Option>
                </Select>
              }
              suffix={
                (search || filterStatus !== 'opened') && (
                  <Button
                    onClick={handleReset}
                    title="Reset search filters..."
                    type="text"
                    size="small"
                    icon={<IconCircleX />}
                  />
                )
              }
              placeholder="Search..."
            />
          </div>
          {loading && <LoadingOutlined size={32} />}
        </div>
      </div>

      <Card>
        {list && (
          <Table
            rowKey="id"
            dataSource={list.data}
            pagination={{ position: ['bottomCenter'] }}
          >
            <Table.Column
              title={
                <div>
                  <span>
                    <IconHistory />
                  </span>{' '}
                  {list.pagination.totalItems} Revisions
                </div>
              }
              dataIndex="name"
              key="name"
              render={(_, item: ApiRevision) => {
                return (
                  <>
                    <Link
                      to={`/${params.org_id}/${params.project_slug}/revisions/${item.id}`}
                      relative="path"
                      className={cls.title}
                    >
                      {item.name}
                    </Link>
                    <div className={cls.subtitle}>
                      <StatusTag
                        status={item.status}
                        locked={item.locked}
                        merged={item.merged}
                      />{' '}
                      opened <Time time={item.createdAt} />
                    </div>
                  </>
                );
              }}
            />
          </Table>
        )}
      </Card>
    </Container>
  );
};
