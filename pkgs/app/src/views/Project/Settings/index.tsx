import { App, Button, Card, Input, Modal, Typography } from 'antd';
import type { ApiProject } from 'api/src/types/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { deleteProject } from '../../../api/projects';
import { Container } from '../../../components/Container';
import type { RouteProject } from '../../../types/routes';

import cls from './index.module.scss';

export const ProjectSettings: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
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

  return (
    <Container className={cls.container}>
      <Card>
        <div>
          <Typography.Title level={4}>Rename this project</Typography.Title>
          <Input.Group compact>
            <Input value={proj.name} style={{ width: '250px' }} />
            <Button type="primary">Rename</Button>
          </Input.Group>
        </div>
      </Card>

      <Card>
        <div className={cls.gridAction}>
          <div>
            <Typography.Title level={4}> Delete this project</Typography.Title>
            Deleting a project can't be reverted.
          </div>
          <Button danger onClick={showModal}>
            Delete
          </Button>
        </div>
      </Card>

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
