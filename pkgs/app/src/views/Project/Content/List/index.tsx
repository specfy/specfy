import {
  SearchOutlined,
  CloseCircleOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { Button, Empty, Input, Skeleton, Table } from 'antd';
import type { ApiDocument, ApiProject } from 'api/src/types/api';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { useListDocuments } from '../../../../api/documents';
import { Time } from '../../../../components/Time';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

export const ProjectContentList: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const [search, setSearch] = useState<string>('');
  const [searchDebounced, setSearchDebounced] = useState<string>('');
  useDebounce(
    () => {
      setSearchDebounced(search);
    },
    500,
    [search]
  );
  const res = useListDocuments({
    org_id: params.org_id,
    project_id: proj.id,
    search: searchDebounced,
  });

  // Handler
  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearch(e.target.value);
  };
  const handleReset = () => {
    setSearch('');
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
              suffix={
                search && (
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
                <ReadOutlined /> {res.data.pagination.totalItems} Documents
              </div>
            }
            dataIndex="name"
            className={cls.tcell}
            key="name"
            render={(_, item: ApiDocument) => {
              return (
                <>
                  <Link
                    to={`/org/${params.org_id}/${params.project_slug}/rfc/${item.typeId}/${item.slug}`}
                    relative="path"
                    className={cls.title}
                  >
                    RFC-{item.typeId} - {item.name}
                  </Link>
                  <div className={cls.subtitle}>
                    Updated <Time time={item.updatedAt} />
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
