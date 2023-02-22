import { PlusOutlined } from '@ant-design/icons';
import { Button, Skeleton, Table } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiDocument } from 'api/src/types/api/documents';
import type { ApiProject } from 'api/src/types/api/projects';
import { Link } from 'react-router-dom';

import { useListDocuments } from '../../api/documents';

import cls from './index.module.scss';

export const ListRFCs: React.FC<{ project: ApiProject }> = ({ project }) => {
  const l = useListDocuments({ org_id: project.orgId, project_id: project.id });

  if (l.isLoading) {
    return (
      <div>
        <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
      </div>
    );
  }

  return (
    <div>
      <div className={cls.header}>
        <Title level={5}>Technical Specs</Title>

        <div>
          <Button type="primary" size="small" icon={<PlusOutlined />} ghost>
            Create
          </Button>
        </div>
      </div>

      {!l.data ||
        (l.data.data.length <= 0 && (
          <div className={cls.empty}>
            Your technical specs will be listed here.
          </div>
        ))}
      {l.data && l.data.data.length > 0 && (
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
        </Table>
      )}
    </div>
  );
};
