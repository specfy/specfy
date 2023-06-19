import { Typography, Input, Button, Modal, App, Form } from 'antd';
import type { ApiProject } from 'api/src/types/api';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { deleteProject, updateProject } from '../../../../api';
import { isError } from '../../../../api/helpers';
import { i18n } from '../../../../common/i18n';
import { slugify, titleSuffix } from '../../../../common/string';
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
  const [slug, setSlug] = useState(() => proj.slug);
  const onName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setName(e.target.value);
    setSlug(slugify(e.target.value));
  };
  const nameChanged = name !== proj.name;

  const handleRename = async () => {
    const res = await updateProject(params, { name });
    if (isError(res)) {
      message.error(i18n.errorOccurred);
      return;
    }

    message.success('Project renamed');
    navigate(`/${params.org_id}/${res.data.slug}/settings`);
  };
  const handleReset = () => {
    setName(proj.name);
    setSlug(proj.slug);
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

    navigate(`/${params.org_id}`);
  };

  return (
    <>
      <Helmet title={`Settings - ${proj.name} ${titleSuffix}`} />

      <div>
        <div>
          <Typography.Title level={2}>General Settings</Typography.Title>
          <Typography.Text type="secondary">
            Manage your project general&apos;s settings
          </Typography.Text>
        </div>
      </div>
      <Card>
        <Form layout="vertical" onFinish={handleRename}>
          <Card.Content>
            <Form.Item
              label="Name"
              extra={
                <div className={cls.desc}>
                  The project is accessible at{' '}
                  <em>
                    https://app.specfy.io/
                    {proj.orgId}/<strong>{slug}</strong>
                  </em>
                </div>
              }
            >
              <Input value={name} onChange={onName} />
            </Form.Item>
          </Card.Content>

          <Card.Actions>
            {nameChanged && (
              <Button type="text" onClick={handleReset}>
                reset
              </Button>
            )}
            <Button type="primary" htmlType="submit" disabled={!nameChanged}>
              Rename
            </Button>
          </Card.Actions>
        </Form>
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
            loading={waitToRead}
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
