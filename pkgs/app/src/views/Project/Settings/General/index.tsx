import { Typography, Input, Button, Modal, App, Form } from 'antd';
import type { ApiProject } from 'api/src/types/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { deleteProject } from '../../../../api/projects';
import { Card } from '../../../../components/Card';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

export const SettingsGeneral: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waitToRead, setWaitToRead] = useState(true);

  // Edit
  const [name, setName] = useState(() => proj.name);
  const onName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setName(e.target.value);
  };

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
    <>
      <div>
        <div>
          <Typography.Title level={2}>General Settings</Typography.Title>
          <Typography.Text type="secondary">
            Manage your project general&apos;s settings
          </Typography.Text>
        </div>
      </div>
      <Card>
        <Card.Content>
          <Form layout="vertical">
            <Form.Item
              label="Name"
              extra={
                <div className={cls.desc}>
                  The project is accessible at{' '}
                  <em>
                    https://specfy.com/org/
                    {proj.orgId}/<strong>{proj.slug}</strong>
                  </em>
                </div>
              }
            >
              <Input value={name} onChange={onName} />
            </Form.Item>
          </Form>
        </Card.Content>

        <Card.Actions>
          <Button type="text">reset</Button>
          <Button type="primary">Save</Button>
        </Card.Actions>
      </Card>

      <Card padded>
        <div className={cls.actions}>
          <div>
            <Typography.Title level={4}>Delete this project</Typography.Title>
            <Typography.Text type="secondary">
              Deleting a project can&apos;t be undone.
            </Typography.Text>
          </div>
          <Button danger type="primary" onClick={showModal}>
            Delete Project
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
            cancel
          </Button>,
          <Button
            danger
            key="submit"
            type="primary"
            disabled={waitToRead}
            onClick={confirmDelete}
          >
            Delete Project
          </Button>,
        ]}
      >
        <p>
          Are you sure to delete this project? <br></br>This action can&apos;t
          be undone.
        </p>
      </Modal>
    </>
  );
};
