import { Breadcrumb, Card, Col, Row, Skeleton, Tag } from 'antd';
import Title from 'antd/es/typography/Title';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMount } from 'react-use';

import { BigHeading } from '../../components/BigHeading';

import cls from './index.module.scss';

const tmp = {
  id: 'nodejs',
  name: 'NodeJS',
  type: 'language',
  icon: 'nodejs',
  createdAt: '2023-01-01T00:00:00Z',
  updatedAt: '2023-01-01T00:00:00Z',
};

export const Tech: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<typeof tmp>();
  const projectId = '3hjfe8SUHer-crawler';

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
              <Skeleton active paragraph={{ rows: 3 }}></Skeleton>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }

  return (
    <div className={cls.container}>
      <Row gutter={[16, 16]}>
        <Col span={18}>
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/">Home</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
          <BigHeading
            title={item.name}
            avatar={<i className={`devicon-${item.icon}-plain`}></i>}
          >
            <Tag>{item.type}</Tag>
          </BigHeading>
        </Col>
        <Col span={18}>
          <Card>
            <Title level={5}>Used in</Title>
            <Row className={cls.technical}>
              <Col span={3}>Projects</Col>
              <Col>
                <Link to="/p/">Dashboard</Link>,{' '}
                <Link to="/p/">Analytics API</Link>
              </Col>
            </Row>

            <Row className={cls.technical}>
              <Col span={3}>Components</Col>
              <Col>
                <Link to={`/p/${projectId}/c/`}>Public API</Link>,{' '}
                <Link to={`/p/${projectId}/c/`}>Private API</Link>,{' '}
                <Link to={`/p/${projectId}/c/`}>Frontend</Link>,{' '}
                <Link to={`/p/${projectId}/c/`}>Email Cron</Link>,{' '}
                <Link to={`/p/${projectId}/c/`}>Message Consumer</Link>,{' '}
                <Link to={`/p/${projectId}/c/`}>Fetcher</Link>,{' '}
                <Link to={`/p/${projectId}/c/`}>Job Processor</Link>,{' '}
                <Link to={`/p/${projectId}/c/`}>Indexer</Link>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
