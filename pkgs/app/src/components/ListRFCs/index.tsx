import type { ApiDocument, ApiProject } from '@specfy/api/src/types/api';
import { IconFileText } from '@tabler/icons-react';
import { Skeleton, Table } from 'antd';
import { Link } from 'react-router-dom';

import { useListDocuments } from '../../api';
import { TYPE_TO_TEXT } from '../../common/document';

import cls from './index.module.scss';

export const ListRFCs: React.FC<{ project: ApiProject }> = ({ project }) => {
  const l = useListDocuments({
    org_id: project.orgId,
    project_id: project.id,
    type: 'rfc',
  });

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
        <h5>Technical Specs</h5>
      </div>

      {!l.data ||
        (l.data.data.length <= 0 && (
          <div className={cls.empty}>
            Your technical specs will be listed here.
          </div>
        ))}
      {l.data && l.data.data.length > 0 && (
        <Table rowKey="id" dataSource={l.data!.data} pagination={false}>
          <Table.Column
            title=""
            dataIndex="name"
            key="name"
            className={cls.tcell}
            render={(_, item: ApiDocument) => {
              return (
                <Link
                  to={`/${project.orgId}/${project.slug}/content/${item.id}-${item.slug}`}
                  relative="path"
                  className={cls.title}
                >
                  <span>
                    <IconFileText />
                  </span>
                  {TYPE_TO_TEXT[item.type]}-{item.typeId} - {item.name}
                </Link>
              );
            }}
          />
        </Table>
      )}
    </div>
  );
};
