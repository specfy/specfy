import {
  MoreOutlined,
  GithubOutlined,
  SlackOutlined,
  LinkOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import {
  App,
  Button,
  Card,
  Col,
  Divider,
  Dropdown,
  Modal,
  Row,
  Typography,
} from 'antd';
import type { ItemType } from 'antd/es/menu/hooks/useItems';
import type { ApiComponent } from 'api/src/types/api/components';
import type { ApiProject } from 'api/src/types/api/projects';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { deleteProject } from '../../../api/projects';
import { BigHeading } from '../../../components/BigHeading';
import { Container } from '../../../components/Container';
import { Graph } from '../../../components/Graph';
import { ListRFCs } from '../../../components/ListRFCs';
import { ListUpdates } from '../../../components/ListUpdates';
import { Time } from '../../../components/Time';
import type { RouteProject } from '../../../types/routes';

import { Team } from './Team';
import { TechnicalAspects } from './TechnicalAspect';
import cls from './index.module.scss';

export const ProjectHome: React.FC<{
  proj: ApiProject;
  comps: ApiComponent[];
  params: RouteProject;
}> = ({ proj, comps, params }) => {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waitToRead, setWaitToRead] = useState(true);

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

  return (
    <Container className={cls.container}>
      <div className={cls.left}>
        <div className={cls.header}>
          <BigHeading
            title={proj.name}
            subtitle={<Time time={proj.updatedAt} />}
            actions={
              <div>
                <Link to={`/org/${params.org_id}/${params.project_slug}/edit`}>
                  <Dropdown.Button
                    type="default"
                    menu={{ items: actions }}
                    icon={<MoreOutlined />}
                  >
                    Edit
                  </Dropdown.Button>
                </Link>
              </div>
            }
          ></BigHeading>
        </div>
        <Card>
          <div dangerouslySetInnerHTML={{ __html: proj.description }}></div>

          <div className={cls.block}>
            <Typography.Title level={5}>Technical Aspect</Typography.Title>
            {comps ? (
              <TechnicalAspects
                components={comps}
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
          <Graph components={comps}></Graph>
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
