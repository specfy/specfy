import { Empty, Skeleton, Table } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiDocument } from 'api/src/types/api/documents';
import type { ApiProject } from 'api/src/types/api/projects';
import { Link } from 'react-router-dom';

import { useListDocuments } from '../../api/documents';
import { RFCStatusTag } from '../RFCStatusTag';

export const ListRFCs: React.FC<{ project: ApiProject }> = ({ project }) => {
  const l = useListDocuments({ org_id: project.orgId, project_id: project.id });

  if (l.isLoading) {
    return (
      <div>
        <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
      </div>
    );
  }

  if (!l.data) {
    <div>
      <Title level={5}>Technical Specs</Title>
      <Empty></Empty>
    </div>;
  }

  return (
    <div>
      <Title level={5}>Technical Specs</Title>
      <Table rowKey="id" dataSource={l.data!.data} size="small">
        <Table.Column
          title=""
          dataIndex="name"
          key="name"
          render={(_, item: ApiDocument) => {
            return (
              <Link
                to={`/org/${project.orgId}/${project.slug}/${item.type}/${item.typeId}/${item.slug}`}
                relative="path"
              >
                RFC-{item.typeId} - {item.name}
              </Link>
            );
          }}
        />
        <Table.Column
          title="Status"
          dataIndex="status"
          render={(_, item: ApiDocument) => {
            return <RFCStatusTag status={item.status} locked={item.locked} />;
          }}
        />
      </Table>
    </div>
  );
};
