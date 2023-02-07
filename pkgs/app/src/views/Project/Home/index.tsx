import { DeleteOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, Modal, Row, Typography } from 'antd';
import type { ItemType } from 'antd/es/menu/hooks/useItems';
import type { ApiComponent } from 'api/src/types/api/components';
import type { ApiProject } from 'api/src/types/api/projects';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { deleteProject } from '../../../api/projects';
import { ListActivity } from '../../../components/ListActivity';
import { ListRFCs } from '../../../components/ListRFCs';
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
    <>
      <Row gutter={[16, 16]}>
        <Col span={24}>
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
        </Col>

        <Col span={15}>
          <Card>
            <ListRFCs project={proj}></ListRFCs>
          </Card>
        </Col>
        <Col span={9}>
          <Card>
            <ListActivity
              orgId={params.org_id}
              projectSlug={params.project_slug}
            />
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
    </>
  );
};
