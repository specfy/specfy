import {
  MoreOutlined,
  GithubOutlined,
  SlackOutlined,
  LinkOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  App,
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  Modal,
  Row,
  Skeleton,
} from 'antd';
import type { ItemType } from 'antd/es/menu/hooks/useItems';
import Title from 'antd/es/typography/Title';
import type { ApiProject } from 'api/src/types/api/projects';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { deleteProject, useGetProject } from '../../api/projects';
import { AvatarAuto } from '../../components/AvatarAuto';
import { BigHeading } from '../../components/BigHeading';
import { Container } from '../../components/Container';
import { ListRFCs } from '../../components/ListRFCs';
import { ListUpdates } from '../../components/ListUpdates';
import imgUrl from '../../static/infra.png';

import cls from './index.module.scss';

export const Project: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [item, setItem] = useState<ApiProject>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waitToRead, setWaitToRead] = useState(true);
  const pathParams = useParams<{ orgId: string; projectSlug: string }>();
  const p = useMemo(() => {
    return { orgId: pathParams.orgId!, slug: pathParams.projectSlug! };
  }, [pathParams]);

  const l = useGetProject(p);

  const showModal = () => {
    setIsModalOpen(true);
    setTimeout(() => setWaitToRead(false), 2000);
  };
  const cancelDelete = () => {
    setIsModalOpen(false);
    setWaitToRead(true);
  };
  const confirmDelete = async () => {
    const res = await deleteProject(p);
    message.success('Project deleted');

    navigate(`/org/${p.orgId}`);
  };

  const actions = useMemo<ItemType[]>(() => {
    return [
      {
        key: 'remove',
        label: 'Delete',
        icon: <DeleteOutlined />,
        onClick: showModal,
        danger: true,
      },
    ];
  }, []);

  useEffect(() => {
    setItem(l.data?.data);
  }, [l.isLoading]);

  if (l.isLoading) {
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

  if (!item) {
    return <div>not found</div>;
  }

  return (
    <Container>
      <Row gutter={[16, 16]}>
        <Col span={18}>
          <div className={cls.header}>
            <div>
              <Breadcrumb style={{ margin: '0 0 4px 4px' }}>
                <Breadcrumb.Item>
                  <Link to="/">Home</Link>
                </Breadcrumb.Item>
              </Breadcrumb>
              <BigHeading title={item.name}>Last update 5 hours ago</BigHeading>
            </div>
            <div>
              <Dropdown.Button
                type="default"
                menu={{ items: actions }}
                icon={<MoreOutlined />}
              >
                Edit
              </Dropdown.Button>
            </div>
          </div>
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
                <Link to={`/org/${p.orgId}/${p.slug}/c/public-api`}>
                  Public API
                </Link>
                ,{' '}
                <Link to={`/org/${p.orgId}/${p.slug}/c/public-api`}>
                  Private API
                </Link>
                ,{' '}
                <Link to={`/org/${p.orgId}/${p.slug}/c/public-api`}>
                  Frontend
                </Link>
                ,{' '}
                <Link to={`/org/${p.orgId}/${p.slug}/c/public-api`}>
                  Email Cron
                </Link>
                ,{' '}
                <Link to={`/org/${p.orgId}/${p.slug}/c/public-api`}>
                  Message Consumer
                </Link>
                ,{' '}
                <Link to={`/org/${p.orgId}/${p.slug}/c/public-api`}>
                  Fetcher
                </Link>
                ,{' '}
                <Link to={`/org/${p.orgId}/${p.slug}/c/public-api`}>
                  Job Processor
                </Link>
                ,{' '}
                <Link to={`/org/${p.orgId}/${p.slug}/c/public-api`}>
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
            {/* <div className={cls.team}>
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
              )} */}
            {/* </div> */}
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
            <ListRFCs project={l.data!.data}></ListRFCs>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <ListUpdates orgId={p.orgId} projectSlug={p.slug}></ListUpdates>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Delete this project?"
        open={isModalOpen}
        onOk={confirmDelete}
        onCancel={cancelDelete}
        footer={[
          <Button key="back" type="text" onClick={cancelDelete}>
            Return
          </Button>,
          <Button
            danger
            key="submit"
            type="primary"
            disabled={waitToRead}
            onClick={confirmDelete}
          >
            Delete
          </Button>,
        ]}
      >
        <p>
          Are you sure to delete this project? <br></br>This action is not
          reversible
        </p>
      </Modal>
    </Container>
  );
};
