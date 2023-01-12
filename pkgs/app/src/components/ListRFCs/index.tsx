import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import Title from 'antd/es/typography/Title';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMount } from 'react-use';

const tmpList = [
  {
    id: '7',
    type: 'spec',
    typeId: '3',
    name: 'Use of Oauth2 in authentication system',
    slug: 'use-of-oauth2-in-authentication-system',
    define: '2',
    uses: ['4', '6'],
    tldr: '',
    motivation: '',
    content: '...',
    authors: [''],
    reviewers: [''],
    approvedBy: [],
    status: 'rejected',
    locked: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '6',
    type: 'spec',
    typeId: '2',
    name: 'Frontend Definition',
    slug: 'frontend-definition',
    define: '2',
    uses: ['4', '6'],
    tldr: '',
    motivation: '',
    content: '...',
    authors: [''],
    reviewers: [''],
    approvedBy: [],
    status: 'draft',
    locked: false,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
  {
    id: '5',
    type: 'spec',
    typeId: '1',
    name: 'API Definition',
    slug: 'api-definition',
    define: '3',
    uses: ['4', '6'],
    tldr: '',
    motivation: '',
    content: '...',
    authors: [''],
    reviewers: [''],
    approvedBy: [],
    status: 'approved',
    locked: true,
    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2023-01-01T00:00:00Z',
  },
];

type RFC = (typeof tmpList)[0];

const columns: ColumnsType<(typeof tmpList)[0]> = [
  {
    title: '',
    dataIndex: 'name',
    render: (_, item) => {
      return (
        <Link to={`/p//rfc/${item.id}-${item.slug}`} relative="path">
          RFC-{item.typeId} - {item.name}
        </Link>
      );
    },
  },
  {
    title: 'status',
    dataIndex: 'status',
    render: (_, item) => {
      if (item.status === 'approved')
        return <Tag color="success">approved</Tag>;
      else if (item.status === 'draft') return <Tag color="default">draft</Tag>;
      else if (item.status === 'rejected')
        return <Tag color="red">rejected</Tag>;
    },
  },
];

export const ListRFCs: React.FC = () => {
  const [initLoading, setInitLoading] = useState(true);
  const [list, setList] = useState<typeof tmpList>([]);
  const { projectId } = useParams();

  useMount(() => {
    setTimeout(() => {
      setInitLoading(false);
      setList(tmpList);
    }, 1000);
  });

  return (
    <div>
      <Title level={5}>Technical Specs</Title>
      <Table rowKey="id" dataSource={tmpList} size="small">
        <Table.Column
          title=""
          dataIndex="name"
          key="name"
          render={(_, item: RFC) => {
            return (
              <Link
                to={`/p/${projectId}/rfc/${item.id}-${item.slug}`}
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
          render={(_, item: RFC) => {
            if (item.status === 'approved')
              return <Tag color="success">approved</Tag>;
            else if (item.status === 'draft')
              return <Tag color="default">draft</Tag>;
            else if (item.status === 'rejected')
              return <Tag color="red">rejected</Tag>;
          }}
        />
      </Table>
    </div>
  );
};
