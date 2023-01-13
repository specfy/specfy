import { PlusOutlined, MinusOutlined } from '@ant-design/icons';
import { Row, Col, Skeleton, Card, Typography, Avatar, Space } from 'antd';
import Title from 'antd/es/typography/Title';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMount } from 'react-use';

import { RFCStatusTag } from '../../components/RFCStatusTag';

import cls from './index.module.scss';

const tmp = {
  id: '5',
  type: 'spec',
  typeId: '1',
  name: 'API definition',
  slug: 'api-definition',
  define: '3',
  update: ['2'],
  uses: ['4', '6'],
  removes: ['1'],
  tldr: '',
  motivation: '',
  content: `
  <h3>Overview</h3>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque aliquam eget nibh eu sodales. Donec bibendum eros at tincidunt aliquam. Praesent non ipsum in enim elementum posuere. Aenean pellentesque et velit quis pretium. Duis et ligula imperdiet, fermentum nulla et, viverra magna. Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula. Nunc eget blandit metus. Etiam interdum laoreet libero eu pharetra. Phasellus lobortis mauris posuere velit finibus, a ultrices neque faucibus. Maecenas laoreet varius quam. </p>

  <h3>Goals and Non-Goals</h3>
  <p>Donec scelerisque ante vel felis gravida bibendum. Vestibulum quam purus, porta ac ornare sit amet, imperdiet at augue. Duis ac libero nec magna malesuada rhoncus at sit amet purus. Donec sed vulputate est. Donec accumsan ullamcorper auctor. Ut orci lectus, ornare id interdum sit amet, hendrerit et elit. Proin venenatis semper ipsum eget cursus. Aliquam nunc ante, sodales eget egestas id, elementum et dui.</p>

  <h3>Background & Motivation</h3>
  <p>Pellentesque suscipit venenatis tellus vitae posuere. Donec at tellus ut ligula efficitur fermentum. Nam pharetra arcu et mattis porta. Aliquam vehicula quam non nisl tincidunt dignissim. Nunc egestas mi in ligula dignissim tristique. Vestibulum quis lacinia arcu. Fusce vehicula enim vitae erat feugiat, at laoreet tortor blandit.</p>

  <h3>Implementations</h3>
  <p>Phasellus orci ante, lobortis vel ullamcorper at, placerat eget leo. Pellentesque in nisi aliquam, rutrum nunc quis, bibendum velit. Etiam efficitur lacinia cursus. Duis neque nunc, consequat sit amet dignissim vel, semper a eros. Duis vel augue ut mauris molestie sodales nec id diam. Aenean blandit ornare nisl vitae venenatis. Ut accumsan ultricies lacinia. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Suspendisse potenti. Vestibulum ipsum dolor, rhoncus vel arcu non, sollicitudin eleifend quam. Fusce et nisi mi. Maecenas nisi quam, interdum at eros vitae, aliquam rutrum nunc. Praesent et pharetra dolor. Nam hendrerit nulla ex, vel lacinia ligula interdum a.</p>

  <p>Praesent sodales lorem id diam pellentesque, quis tincidunt risus porttitor. Vivamus dapibus aliquet ipsum. Nullam non leo neque. Aliquam in enim id nulla elementum pretium. Nullam scelerisque quam ut mattis egestas. Ut semper eros ipsum, eget rutrum nisi consequat vitae. Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo. Nunc id tellus felis. Suspendisse dui massa, volutpat ac tincidunt eu, cursus eget metus. Proin vel viverra mi. Maecenas a finibus felis, et dapibus orci. Sed molestie sed ex vitae sodales. Vestibulum ut leo posuere nulla commodo iaculis.</p>`,
  authors: ['1'],
  reviewers: ['2', '3'],
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
        </Row>
      </div>
    );
  }

  return (
    <div className={cls.container}>
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
            <ul className={cls.userList}>
              <li>
                <PlusOutlined style={{ color: '#52c41a' }} /> Defines{' '}
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
            <Typography>
              <div dangerouslySetInnerHTML={{ __html: item.content }}></div>
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
                      <Avatar></Avatar>
                      user
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
                      <Avatar></Avatar>
                      user
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
