import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import {
  Row,
  Col,
  Skeleton,
  Card,
  Typography,
  Space,
  Breadcrumb,
  Divider,
} from 'antd';
import Title from 'antd/es/typography/Title';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMount } from 'react-use';

import { AvatarAuto } from '../../components/AvatarAuto';
import { RFCStatusTag } from '../../components/RFCStatusTag';

import cls from './index.module.scss';

interface Block {
  type: 'content' | 'title';
  content: string;
}

const tmp = {
  id: '5',
  type: 'spec',
  typeId: '1',
  name: 'API definition',
  slug: 'api-definition',
  create: '3',
  update: ['2'],
  uses: ['4', '6'],
  removes: ['1'],
  tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
  motivation: '',
  blocks: [
    { type: 'title', content: 'Overview' },
    {
      type: 'content',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque aliquam eget nibh eu sodales. Donec bibendum eros at tincidunt aliquam. Praesent non ipsum in enim elementum posuere. Aenean pellentesque et velit quis pretium. Duis et ligula imperdiet, fermentum nulla et, viverra magna. Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula. Nunc eget blandit metus. Etiam interdum laoreet libero eu pharetra. Phasellus lobortis mauris posuere velit finibus, a ultrices neque faucibus. Maecenas laoreet varius quam.',
    },
    { type: 'title', content: 'Goals and Non-Goals' },
    {
      type: 'content',
      content:
        'Donec scelerisque ante vel felis gravida bibendum. Vestibulum quam purus, porta ac ornare sit amet, imperdiet at augue. Duis ac libero nec magna malesuada rhoncus at sit amet purus. Donec sed vulputate est. Donec accumsan ullamcorper auctor. Ut orci lectus, ornare id interdum sit amet, hendrerit et elit. Proin venenatis semper ipsum eget cursus. Aliquam nunc ante, sodales eget egestas id, elementum et dui.',
    },
    { type: 'title', content: 'Background & Motivation' },
    {
      type: 'content',
      content:
        'Pellentesque suscipit venenatis tellus vitae posuere. Donec at tellus ut ligula efficitur fermentum. Nam pharetra arcu et mattis porta. Aliquam vehicula quam non nisl tincidunt dignissim. Nunc egestas mi in ligula dignissim tristique. Vestibulum quis lacinia arcu. Fusce vehicula enim vitae erat feugiat, at laoreet tortor blandit.',
    },
    { type: 'title', content: 'Implementations' },
    {
      type: 'content',
      content:
        'Phasellus orci ante, lobortis vel ullamcorper at, placerat eget leo. Pellentesque in nisi aliquam, rutrum nunc quis, bibendum velit. Etiam efficitur lacinia cursus. Duis neque nunc, consequat sit amet dignissim vel, semper a eros. Duis vel augue ut mauris molestie sodales nec id diam. Aenean blandit ornare nisl vitae venenatis. Ut accumsan ultricies lacinia. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Suspendisse potenti. Vestibulum ipsum dolor, rhoncus vel arcu non, sollicitudin eleifend quam. Fusce et nisi mi. Maecenas nisi quam, interdum at eros vitae, aliquam rutrum nunc. Praesent et pharetra dolor. Nam hendrerit nulla ex, vel lacinia ligula interdum a.',
    },
    {
      type: 'content',
      content:
        'Praesent sodales lorem id diam pellentesque, quis tincidunt risus porttitor. Vivamus dapibus aliquet ipsum. Nullam non leo neque. Aliquam in enim id nulla elementum pretium. Nullam scelerisque quam ut mattis egestas. Ut semper eros ipsum, eget rutrum nisi consequat vitae. Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo. Nunc id tellus felis. Suspendisse dui massa, volutpat ac tincidunt eu, cursus eget metus. Proin vel viverra mi. Maecenas a finibus felis, et dapibus orci. Sed molestie sed ex vitae sodales. Vestibulum ut leo posuere nulla commodo iaculis.',
    },
  ],
  authors: ['1'],
  reviewers: ['2'],
  approvedBy: ['3'],
  status: 'approved',
  locked: true,
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const RFC: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<typeof tmp>();

  useMount(() => {
    setTimeout(() => {
      setLoading(false);
      setItem(tmp);
    }, 1000);
  });

  if (loading || !item) {
    return (
      <div className={cls.container}>
        <Row gutter={[16, 16]}>
          <Col span={18}>
            <Skeleton active paragraph={false} className={cls.skeletonTitle} />
          </Col>

          <Col span={18}>
            <Card>
              <Skeleton active paragraph={{ rows: 4 }}></Skeleton>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className={cls.container}>
      <Breadcrumb>
        <Breadcrumb.Item>
          <Link to="/p/3hjfe8SUHer-crawler/">Crawler</Link>
        </Breadcrumb.Item>
      </Breadcrumb>
      <Row gutter={[16, 16]}>
        <Col span={18}>
          <Title level={2} className={cls.title}>
            {item.name}{' '}
            <Typography.Text type="secondary" className={cls.subtitle}>
              RFC-{item.typeId}
            </Typography.Text>
          </Title>
          <Space>
            <RFCStatusTag status={item.status} locked={item.locked} />
            <div className={cls.lastUpdate}>Last update 5 hours ago</div>
          </Space>
        </Col>
        <Col span={6}></Col>
        <Col span={18}>
          <Card>
            <Typography className={cls.content}>
              {item.tldr && <p>{item.tldr}</p>}

              <ul className={cls.tldrList}>
                <li>
                  <PlusOutlined style={{ color: '#52c41a' }} /> Creates{' '}
                  <Link to="/">Public API</Link>
                </li>
                <li>
                  <PlusOutlined style={{ color: '#52c41a' }} /> Updates{' '}
                  <Link to="/">Postgres</Link>
                </li>
                <li>
                  <PlusOutlined style={{ color: '#52c41a' }} /> Introduces{' '}
                  <Link to="/">NodeJS</Link>
                </li>
                <li>
                  <MinusOutlined style={{ color: '#fa541c' }} /> Removes{' '}
                  <Link to="/">Golang</Link>
                </li>
              </ul>

              <Divider />

              {item.blocks.map((blk) => {
                if (blk.type === 'title') return <h4>{blk.content}</h4>;
                else if (blk.type === 'content') return <p>{blk.content}</p>;
              })}
            </Typography>
          </Card>
        </Col>
        <Col span={6}>
          <div className={cls.infoBlock}>
            <div className={cls.infoHeader}>Authors</div>
            <ul className={cls.userList}>
              {item.authors.map((id) => {
                return (
                  <li key={id}>
                    <Space>
                      <AvatarAuto name="samuel bodin" />
                      Samuel Bodin
                    </Space>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className={cls.infoBlock}>
            <div className={cls.infoHeader}>Reviewers</div>
            <ul className={cls.userList}>
              {item.reviewers.map((id) => {
                return (
                  <li key={id}>
                    <Space>
                      <AvatarAuto name="Nicola Torres" />
                      Nicolas Torres
                    </Space>
                  </li>
                );
              })}
            </ul>
          </div>
        </Col>
      </Row>
    </div>
  );
};
