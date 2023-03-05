import { LoadingOutlined } from '@ant-design/icons';
import { IconBook, IconCircleX, IconSearch } from '@tabler/icons-react';
import { Button, Input, Table } from 'antd';
import type {
  ApiDocument,
  ApiProject,
  ResListDocuments,
} from 'api/src/types/api';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDebounce } from 'react-use';

import { useListDocuments } from '../../../../api/documents';
import { Card } from '../../../../components/Card';
import { Time } from '../../../../components/Time';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

export const ProjectContentList: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [list, setList] = useState<ResListDocuments>();
  const [search, setSearch] = useState<string>('');
  const [searchDebounced, setSearchDebounced] = useState<string>('');
  useDebounce(
    () => {
      setSearchDebounced(search);
      setLoading(false);
    },
    500,
    [search]
  );
  const res = useListDocuments({
    org_id: params.org_id,
    project_id: proj.id,
    search: searchDebounced,
  });

  useEffect(() => {
    setLoading(res.isLoading);
    if (!res.data) {
      return;
    }

    setList(res.data);
  }, [res.data]);

  // Handler
  const handleInput: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSearch(e.target.value);
    setLoading(true);
  };
  const handleReset = () => {
    setSearch('');
  };

  return (
    <div className={cls.container}>
      <div className={cls.searchWrapper}>
        <div className={cls.search}>
          <Input.Group compact className={cls.inputs}>
            <Input
              size="large"
              prefix={<IconSearch />}
              onChange={handleInput}
              value={search}
              suffix={
                search && (
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
          </Input.Group>
          {loading && <LoadingOutlined size={32} />}
        </div>
      </div>

      <Card>
        {list && (
          <Table
            rowKey="id"
            dataSource={list.data}
            size="small"
            pagination={{ position: ['bottomCenter'] }}
          >
            <Table.Column
              title={
                <div className={cls.th}>
                  <span>
                    <IconBook />
                  </span>{' '}
                  {list.pagination.totalItems} Documents
                </div>
              }
              dataIndex="name"
              className={cls.tcell}
              key="name"
              render={(_, item: ApiDocument) => {
                return (
                  <>
                    <Link
                      to={`/${params.org_id}/${params.project_slug}/rfc/${item.typeId}/${item.slug}`}
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
      </Card>
    </div>
  );
};
