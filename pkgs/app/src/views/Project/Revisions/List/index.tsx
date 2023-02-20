import { HistoryOutlined, SearchOutlined } from '@ant-design/icons';
import { Input, Select, Skeleton, Table } from 'antd';
import type { ApiProject } from 'api/src/types/api';
import type { ApiRevision } from 'api/src/types/api/revisions';
import { Link } from 'react-router-dom';

import { useListRevisions } from '../../../../api/revisions';
import { RFCStatusTag } from '../../../../components/RFCStatusTag';
import { Time } from '../../../../components/Time';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

export const ProjectRevisionsList: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const res = useListRevisions({
    org_id: params.org_id,
    project_id: proj.id,
  });

  if (res.isLoading) {
    return (
      <div>
        <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
      </div>
    );
  }

  return (
    <div className={cls.container}>
      <div className={cls.search}>
        <Input.Group compact>
          <Input
            size="large"
            prefix={<SearchOutlined />}
            addonBefore={
              <Select defaultValue="Open" style={{ width: 'calc(100px)' }}>
                <Select.Option value="Open">Open</Select.Option>
                <Select.Option value="Approved">Approved</Select.Option>
                <Select.Option value="Merged">Merged</Select.Option>
                <Select.Option value="Rejected">Rejected</Select.Option>
                <Select.Option value="All">All</Select.Option>
              </Select>
            }
            placeholder="Search..."
          />
        </Input.Group>
      </div>
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
                <HistoryOutlined /> {res.data.pagination.total} Revisions
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
                    opened <Time time={item.createdAt} />
                  </div>
                </>
              );
            }}
          />
          <Table.Column
            title="Status"
            dataIndex="status"
            className={cls.tcell}
            render={(_, item: ApiRevision) => {
              return (
                <RFCStatusTag
                  status={item.status}
                  locked={item.locked}
                  merged={item.merged}
                />
              );
            }}
          />
        </Table>
      )}
    </div>
  );
};
