import { IconBook } from '@tabler/icons-react';
import { Table } from 'antd';
import type {
  ApiDocument,
  ApiProject,
  ResListDocuments,
} from 'api/src/types/api';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useListDocuments } from '../../../../api/documents';
import { Card } from '../../../../components/Card';
import { Time } from '../../../../components/Time';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

export const ProjectContentList: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const [list, setList] = useState<ResListDocuments>();
  const res = useListDocuments({
    org_id: params.org_id,
    project_id: proj.id,
  });

  useEffect(() => {
    if (!res.data) {
      return;
    }

    setList(res.data);
  }, [res.data]);

  return (
    <div className={cls.list}>
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
                      to={`/${params.org_id}/${params.project_slug}/content/${item.type}-${item.typeId}-${item.slug}`}
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
