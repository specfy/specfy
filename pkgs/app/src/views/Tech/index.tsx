import { Breadcrumb, Card, Col, Row, Skeleton, Tag } from 'antd';
import Title from 'antd/es/typography/Title';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMount } from 'react-use';

import { BigHeading } from '../../components/BigHeading';
import { Container } from '../../components/Container';

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
  const { orgId } = useParams();

  useMount(() => {
    setTimeout(() => {
      setLoading(false);
      setItem(tmp);
    }, 250);
  });

  if (loading || !item) {
    return (
      <Container>
        <Row gutter={[16, 16]}>
          <Col span={18}>
            <Skeleton active paragraph={false} />
          </Col>
          <Col span={18}>
            <Card>
              <Skeleton active paragraph={{ rows: 3 }}></Skeleton>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container>
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
            <Row>
              <Col span={3}>Projects</Col>
              <Col>
                <Link to={`/org/${orgId}/dashboard`}>Dashboard</Link>,{' '}
                <Link to={`/org/${orgId}/dashboard`}>Analytics API</Link>
              </Col>
            </Row>

            <Row>
              <Col span={3}>Components</Col>
              <Col>
                <Link to={`/org/${orgId}/${projectId}/c/`}>Public API</Link>,{' '}
                <Link to={`/org/${orgId}/${projectId}/c/`}>Private API</Link>,{' '}
                <Link to={`/org/${orgId}/${projectId}/c/`}>Frontend</Link>,{' '}
                <Link to={`/org/${orgId}/${projectId}/c/`}>Email Cron</Link>,{' '}
                <Link to={`/org/${orgId}/${projectId}/c/`}>
                  Message Consumer
                </Link>
                , <Link to={`/org/${orgId}/${projectId}/c/`}>Fetcher</Link>,{' '}
                <Link to={`/org/${orgId}/${projectId}/c/`}>Job Processor</Link>,{' '}
                <Link to={`/org/${orgId}/${projectId}/c/`}>Indexer</Link>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
