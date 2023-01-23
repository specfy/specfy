import { Skeleton, Table } from 'antd';
import Title from 'antd/es/typography/Title';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMount } from 'react-use';

import { listContents } from '../../api/contents';
import type { ApiContent } from '../../types/api/contents';
import type { DBContent } from '../../types/db/contents';
import { RFCStatusTag } from '../RFCStatusTag';

export const ListRFCs: React.FC<{ projectId?: string }> = ({ projectId }) => {
  const [initLoading, setInitLoading] = useState(true);
  const [list, setList] = useState<ApiContent[]>([]);

  useMount(() => {
    setTimeout(async () => {
      setInitLoading(false);
      setList(await listContents(projectId!));
    }, 250);
  });

  if (initLoading) {
    return (
      <div>
        <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
      </div>
    );
  }

  return (
    <div>
      <Title level={5}>Technical Specs</Title>
      <Table rowKey="id" dataSource={list} size="small">
        <Table.Column
          title=""
          dataIndex="name"
          key="name"
          render={(_, item: DBContent) => {
            return (
              <Link
                to={`/p/${projectId}/c/${item.id}-${item.slug}`}
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
          render={(_, item: DBContent) => {
            return <RFCStatusTag status={item.status} locked={item.locked} />;
          }}
        />
      </Table>
    </div>
  );
};
