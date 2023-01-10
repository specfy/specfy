import { List, Skeleton } from 'antd';
import { useState } from 'react';
import { useMount } from 'react-use';

interface Project {
  id: string;
  name: string;
  description: string;
}
const tmpList: Project[] = [
  {
    id: 'my-first-infra',
    name: 'My first infrastructure',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  },
  {
    id: 'hello-world',
    name: 'Hello World',
    description:
      'Donec mollis pretium nisl at dignissim. Duis dui magna, tempus a scelerisque id, semper eu metus.',
  },
];

export const ListProjects: React.FC = () => {
  const [initLoading, setInitLoading] = useState(true);
  const [list, setList] = useState<Project[]>([]);

  useMount(() => {
    setTimeout(() => {
      setInitLoading(false);
      setList(tmpList);
    }, 1000);
  });

  return (
    <div>
      <List
        className="demo-loadmore-list"
        loading={initLoading}
        dataSource={list}
        itemLayout="vertical"
        size="small"
        renderItem={(item) => (
          <List.Item key={item.name}>
            <Skeleton title={false} loading={false} active>
              <List.Item.Meta
                title={<a href={`/p/${item.id}`}>{item.name}</a>}
                description={item.description}
              />
            </Skeleton>
          </List.Item>
        )}
      />
    </div>
  );
};
