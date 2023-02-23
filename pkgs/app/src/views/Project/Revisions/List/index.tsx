import {
  CloseCircleOutlined,
  HistoryOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { Button, Empty, Input, Select, Skeleton, Table } from 'antd';
import type { ApiProject } from 'api/src/types/api';
import type {
  ApiRevision,
  ReqListRevisions,
} from 'api/src/types/api/revisions';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { useListRevisions } from '../../../../api/revisions';
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
  const [search, setSearch] = useState<string>('');
  const [searchDebounced, setSearchDebounced] = useState<string>('');
  useDebounce(
    () => {
      setSearchDebounced(search);
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

  // Handler
  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearch(e.target.value);
  };
  const handleReset = () => {
    setSearch('');
    setFilterStatus('opened');
  };

  return (
    <div className={cls.container}>
      <div className={cls.searchWrapper}>
        <div className={cls.search}>
          <Input.Group compact>
            <Input
              size="large"
              prefix={<SearchOutlined />}
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
                  <Select.Option value="rejected">Rejected</Select.Option>
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
                    icon={<CloseCircleOutlined />}
                  />
                )
              }
              placeholder="Search..."
            />
          </Input.Group>
        </div>
      </div>

      {res.isLoading && (
        <div>
          <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
        </div>
      )}

      {res.data && res.data.data.length > 0 && (
        <Table
          rowKey="id"
          dataSource={res.data!.data}
          size="small"
          pagination={{ position: ['bottomCenter'] }}
        >
          <Table.Column
            title={
              <div className={cls.th}>
                <HistoryOutlined /> {res.data.pagination.totalItems} Revisions
              </div>
            }
            dataIndex="name"
            className={cls.tcell}
            key="name"
            render={(_, item: ApiRevision) => {
              return (
                <>
                  <Link
                    to={`/org/${params.org_id}/${params.project_slug}/revisions/${item.id}`}
                    relative="path"
                    className={cls.title}
                  >
                    {item.title}
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
      {res.data && res.data.pagination.totalItems === 0 && <Empty />}
    </div>
  );
};
