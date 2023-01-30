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
  Typography,
} from 'antd';
import type { ItemType } from 'antd/es/menu/hooks/useItems';
import Title from 'antd/es/typography/Title';
import type { ApiProject } from 'api/src/types/api/projects';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useListComponents } from '../../api/components';
import { deleteProject, useGetProject } from '../../api/projects';
import { AvatarAuto } from '../../components/AvatarAuto';
import { BigHeading } from '../../components/BigHeading';
import { Container } from '../../components/Container';
import { ListRFCs } from '../../components/ListRFCs';
import { ListUpdates } from '../../components/ListUpdates';
import { Time } from '../../components/Time';
import imgUrl from '../../static/infra.png';
import type { RouteProject } from '../../types/routes';

import { TechnicalAspects } from './TechnicalAspect';
import cls from './index.module.scss';

export const Project: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const tmpParams = useParams<Partial<RouteProject>>();
  const params = tmpParams as RouteProject;

  const [proj, setProj] = useState<ApiProject>();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waitToRead, setWaitToRead] = useState(true);

  // Data fetch
  const res = useGetProject(params);
  const comps = useListComponents(params.projectSlug, {
    org_id: params.orgId,
    project_id: proj?.id,
  });

  // Delete modal
  const showModal = () => {
    setIsModalOpen(true);
    setTimeout(() => setWaitToRead(false), 2000);
  };
  const cancelDelete = () => {
    setIsModalOpen(false);
    setWaitToRead(true);
  };
  const confirmDelete = async () => {
    await deleteProject(params);
    message.success('Project deleted');

    navigate(`/org/${params.orgId}`);
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
    setProj(res.data?.data);
  }, [res.isLoading]);

  if (res.isLoading || comps.isLoading) {
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

  if (!proj) {
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
              <BigHeading title={proj.name}>
                <Time time={proj.updatedAt} />
              </BigHeading>
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
            <div dangerouslySetInnerHTML={{ __html: proj.description }}></div>
            <Divider plain orientation="left">
              Technical Aspect
            </Divider>
            <Title level={5}></Title>
            {comps.data?.data ? (
              <TechnicalAspects
                components={comps.data.data}
                orgId={params.orgId}
                slug={params.projectSlug}
              />
            ) : (
              <Typography.Text type="secondary">
                Nothing to show.
              </Typography.Text>
            )}

            <Divider plain />
            <Title level={5}>Team</Title>
            {/* <div className={cls.team}>
              <div>
                <div className={cls.teamLabel}>Admin</div>
                <Avatar.Group>
                  {proj.owners.map((user) => {
                    return <AvatarAuto key={user} name="samuel bodin" />;
                  })}
                </Avatar.Group>
              </div>
              {proj.reviewers.length > 0 && (
                <div>
                  <div className={cls.teamLabel}>Reviewers</div>
                  <Avatar.Group>
                    {proj.reviewers.map((user) => {
                      return <AvatarAuto key={user} name="raphael daguenet" />;
                    })}
                  </Avatar.Group>
                </div>
              )}
              {proj.contributors.length > 0 && (
                <div>
                  <div className={cls.teamLabel}>Contributors</div>
                  <Avatar.Group>
                    {proj.contributors.map((user) => {
                      return <AvatarAuto key={user} name="nicolas torres" />;
                    })}
                  </Avatar.Group>
                </div>
              )} */}
            {/* </div> */}
            <Typography.Text type="secondary">Nothing to show.</Typography.Text>
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <div className={cls.infraPng}>
              <img src={imgUrl} alt="" />
            </div>
          </Card>
          {proj.links && (
            <div>
              <Divider />
              {proj.links.map((link) => {
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
            <ListRFCs project={proj}></ListRFCs>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <ListUpdates
              orgId={params.orgId}
              projectSlug={params.projectSlug}
            ></ListUpdates>
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
