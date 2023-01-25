import {
  EditOutlined,
  GithubOutlined,
  SlackOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Row,
  Skeleton,
} from 'antd';
import Title from 'antd/es/typography/Title';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useMount } from 'react-use';

import { getProject } from '../../api/projects';
import { AvatarAuto } from '../../components/AvatarAuto';
import { BigHeading } from '../../components/BigHeading';
import { Container } from '../../components/Container';
import { ListRFCs } from '../../components/ListRFCs';
import { ListUpdates } from '../../components/ListUpdates';
import imgUrl from '../../static/infra.png';
import type { ApiProject } from 'api/src/types/api/projects';

import cls from './index.module.scss';

export const Project: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<ApiProject>();
  const { orgId, projectSlug } = useParams();

  useMount(() => {
    setTimeout(async () => {
      setLoading(false);
      const tmp = await getProject({ orgId: orgId!, slug: projectSlug! });

      if (!tmp) {
        return;
      }

      setItem({
        ...tmp,
        owners: ['1'],
        reviewers: ['1'],
        contributors: ['2', '3', '4'],
      });
    }, 250);
  });

  if (!loading && !item) {
    return <div>not found</div>;
  }

  if (loading || !item) {
    return (
      <Container>
        <Row gutter={[16, 16]}>
          <Col span={18}>
            <Skeleton active paragraph={false} className={cls.skeletonTitle} />
          </Col>
          <Col span={18}>
            <Card>
              <Skeleton active paragraph={{ rows: 3 }}></Skeleton>
              <Divider />
              <Avatar.Group>
                <Skeleton.Avatar active />
                <Skeleton.Avatar active />
                <Skeleton.Avatar active />
              </Avatar.Group>
            </Card>
          </Col>

          <Col span={12}>
            <Card>
              <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Skeleton active title={false} paragraph={{ rows: 3 }}></Skeleton>
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
          <Breadcrumb style={{ margin: '0 0 0 4px' }}>
            <Breadcrumb.Item>
              <Link to="/">Home</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Project</Breadcrumb.Item>
          </Breadcrumb>
          <BigHeading title={item.name}>Last update 5 hours ago</BigHeading>
        </Col>
        <Col span={6}>
          <Button type="primary" icon={<EditOutlined></EditOutlined>}>
            Edit
          </Button>
        </Col>
        <Col span={18}>
          <Card>
            <div dangerouslySetInnerHTML={{ __html: item.description }}></div>
            <Divider plain />
            <Title level={5}>Technical Aspect</Title>
            <Row>
              <Col span={3}>Stack</Col>
              <Col>
                <Link to="/t/nodejs">GCP</Link>,{' '}
                <Link to="/t/nodejs">NodeJS</Link>,{' '}
                <Link to="/t/nodejs">Postgres</Link>,{' '}
                <Link to="/t/nodejs">RabbitMQ</Link>,{' '}
                <Link to="/t/nodejs">Algolia</Link>,{' '}
                <Link to="/t/nodejs">Redis</Link>
              </Col>
            </Row>
            <Row>
              <Col span={3}>Components</Col>
              <Col>
                <Link to={`/org/${orgId}/${projectSlug}/c/public-api`}>
                  Public API
                </Link>
                ,{' '}
                <Link to={`/org/${orgId}/${projectSlug}/c/public-api`}>
                  Private API
                </Link>
                ,{' '}
                <Link to={`/org/${orgId}/${projectSlug}/c/public-api`}>
                  Frontend
                </Link>
                ,{' '}
                <Link to={`/org/${orgId}/${projectSlug}/c/public-api`}>
                  Email Cron
                </Link>
                ,{' '}
                <Link to={`/org/${orgId}/${projectSlug}/c/public-api`}>
                  Message Consumer
                </Link>
                ,{' '}
                <Link to={`/org/${orgId}/${projectSlug}/c/public-api`}>
                  Fetcher
                </Link>
                ,{' '}
                <Link to={`/org/${orgId}/${projectSlug}/c/public-api`}>
                  Job Processor
                </Link>
                ,{' '}
                <Link to={`/org/${orgId}/${projectSlug}/c/public-api`}>
                  Indexer
                </Link>
              </Col>
            </Row>
            <Row>
              <Col span={3}>Link to Project</Col>
              <Col>
                <Link to="/org/algolia/dashboard">Dashboard</Link>,{' '}
                <Link to="/org/algolia/analytics">Analytics API</Link>
              </Col>
            </Row>

            <Divider plain />
            <Title level={5}>Team</Title>
            <div className={cls.team}>
              <div>
                <div className={cls.teamLabel}>Admin</div>
                <Avatar.Group>
                  {item.owners.map((user) => {
                    return <AvatarAuto key={user} name="samuel bodin" />;
                  })}
                </Avatar.Group>
              </div>
              {item.reviewers.length > 0 && (
                <div>
                  <div className={cls.teamLabel}>Reviewers</div>
                  <Avatar.Group>
                    {item.reviewers.map((user) => {
                      return <AvatarAuto key={user} name="raphael daguenet" />;
                    })}
                  </Avatar.Group>
                </div>
              )}
              {item.contributors.length > 0 && (
                <div>
                  <div className={cls.teamLabel}>Contributors</div>
                  <Avatar.Group>
                    {item.contributors.map((user) => {
                      return <AvatarAuto key={user} name="nicolas torres" />;
                    })}
                  </Avatar.Group>
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className={cls.infraPng}>
              <img src={imgUrl} alt="" />
            </div>
          </Card>
          {item.links && (
            <div>
              <Divider />
              {item.links.map((link) => {
                let icon = <LinkOutlined />;
                if (link.title === 'Gihub') icon = <GithubOutlined />;
                else if (link.title === 'Slack') icon = <SlackOutlined />;
                return (
                  <Link
                    key={link.link}
                    className={cls.link}
                    to={link.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {icon} {link.title}
                  </Link>
                );
              })}
            </div>
          )}
        </Col>
        <Col span={10}>
          <Card>
            <ListRFCs orgId={orgId!} projectSlug={projectSlug!}></ListRFCs>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <ListUpdates orgId={orgId!} projectSlug={projectSlug}></ListUpdates>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};
