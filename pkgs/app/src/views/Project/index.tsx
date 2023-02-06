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
import type { ApiProject } from 'api/src/types/api/projects';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { useListComponents } from '../../api/components';
import { deleteProject, useGetProject } from '../../api/projects';
import { BigHeading, BigHeadingLoading } from '../../components/BigHeading';
import { Container } from '../../components/Container';
import { Graph } from '../../components/Graph';
import { ListRFCs } from '../../components/ListRFCs';
import { ListUpdates } from '../../components/ListUpdates';
import { Time } from '../../components/Time';
import type { RouteProject } from '../../types/routes';

import { Team } from './Team';
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
  const comps = useListComponents(params.project_slug, {
    org_id: params.org_id,
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

    navigate(`/org/${params.org_id}`);
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
      <Container className={cls.container}>
        <div className={cls.left}>
          <div className={cls.header}>
            <BigHeadingLoading />
          </div>
          <Card>
            <Skeleton active paragraph={{ rows: 3 }}></Skeleton>
            <Divider />
            <Avatar.Group>
              <Skeleton.Avatar active />
              <Skeleton.Avatar active />
              <Skeleton.Avatar active />
            </Avatar.Group>
          </Card>
        </div>

        <div className={cls.right}></div>
      </Container>
    );
  }

  if (!proj) {
    return <div>not found</div>;
  }

  return (
    <Container className={cls.container}>
      <div className={cls.left}>
        <div className={cls.header}>
          <BigHeading
            title={proj.name}
            subtitle={<Time time={proj.updatedAt} />}
            actions={
              <div>
                <Dropdown.Button
                  type="default"
                  menu={{ items: actions }}
                  icon={<MoreOutlined />}
                >
                  Edit
                </Dropdown.Button>
              </div>
            }
          ></BigHeading>
        </div>
        <Card>
          <div dangerouslySetInnerHTML={{ __html: proj.description }}></div>

          <div className={cls.block}>
            <Typography.Title level={5}>Technical Aspect</Typography.Title>
            {comps.data?.data ? (
              <TechnicalAspects
                components={comps.data.data}
                orgId={params.org_id}
                slug={params.project_slug}
              />
            ) : (
              <Typography.Text type="secondary">
                Nothing to show.
              </Typography.Text>
            )}
          </div>

          <div className={cls.block}>
            <Typography.Title level={5}>Team</Typography.Title>
            <Team org_id={params.org_id} project_id={proj.id} />
          </div>
        </Card>
        <Row gutter={[16, 16]}>
          <Col span={15}>
            <Card>
              <ListRFCs project={proj}></ListRFCs>
            </Card>
          </Col>
          <Col span={9}>
            <Card>
              <ListUpdates
                orgId={params.org_id}
                projectSlug={params.project_slug}
              ></ListUpdates>
            </Card>
          </Col>
        </Row>
      </div>

      <div className={cls.right}>
        <Card bordered={false} size="small">
          <Graph components={comps.data!.data}></Graph>
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
      </div>

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
