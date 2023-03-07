import { IconFileText } from '@tabler/icons-react';
import { Skeleton, Table } from 'antd';
import Title from 'antd/es/typography/Title';
import type { ApiDocument, ApiProject } from 'api/src/types/api';
import { Link } from 'react-router-dom';

import { useListDocuments } from '../../api/documents';
import { typeToText } from '../../common/document';

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
        <Title level={5}>Technical Specs</Title>
      </div>

      {!l.data ||
        (l.data.data.length <= 0 && (
          <div className={cls.empty}>
            Your technical specs will be listed here.
          </div>
        ))}
      {l.data && l.data.data.length > 0 && (
        <Table
          rowKey="id"
          dataSource={l.data!.data}
          size="small"
          pagination={false}
        >
          <Table.Column
            title=""
            dataIndex="name"
            key="name"
            className={cls.tcell}
            render={(_, item: ApiDocument) => {
              return (
                <Link
                  to={`/${project.orgId}/${project.slug}/content/${item.slug}`}
                  relative="path"
                  className={cls.title}
                >
                  <span>
                    <IconFileText />
                  </span>
                  {typeToText[item.type]}-{item.typeId} - {item.name}
                </Link>
              );
            }}
          />
        </Table>
      )}
    </div>
  );
};
