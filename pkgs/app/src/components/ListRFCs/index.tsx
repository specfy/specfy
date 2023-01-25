import { Skeleton, Table } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiContent } from 'api/src/types/api/contents';
import type { DBContent } from 'api/src/types/db/contents';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMount } from 'react-use';

import { listContents } from '../../api/contents';
import { RFCStatusTag } from '../RFCStatusTag';

export const ListRFCs: React.FC<{ orgId: string; projectSlug?: string }> = ({
  orgId,
  projectSlug,
}) => {
  const [initLoading, setInitLoading] = useState(true);
  const [list, setList] = useState<ApiContent[]>([]);

  useMount(() => {
    setTimeout(async () => {
      setInitLoading(false);
      setList(await listContents({ orgId, slug: projectSlug }));
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
                to={`/org/${orgId}/${projectId}/c/${item.id}-${item.slug}`}
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
