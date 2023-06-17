import { Typography, Input, Button, Modal, App, Form } from 'antd';
import type { ApiOrg } from 'api/src/types/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { deleteOrg, updateOrg } from '../../../../api';
import { isError } from '../../../../api/helpers';
import { i18n } from '../../../../common/i18n';
import { Card } from '../../../../components/Card';
import type { RouteOrg } from '../../../../types/routes';

import cls from './index.module.scss';

export const SettingsGeneral: React.FC<{
  org: ApiOrg;
  params: RouteOrg;
}> = ({ org, params }) => {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waitToRead, setWaitToRead] = useState(true);

  // Edit
  const [name, setName] = useState(() => org.name);
  const onName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setName(e.target.value);
  };
  const nameChanged = name !== org.name;

  const handleRename = async () => {
    const res = await updateOrg(params, { name });
    if (isError(res)) {
      message.error(i18n.errorOccurred);
      return;
    }

    message.success('Organization renamed');
  };
  const handleReset = () => {
    setName(org.name);
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
    const res = await deleteOrg(params);
    if (res !== 204) {
      message.error(i18n.errorOccurred);
      return;
    }

    message.success('Organization deleted');
    navigate(`/`);
  };

  return (
    <>
      <div>
        <div>
          <Typography.Title level={2}>General Settings</Typography.Title>
          <Typography.Text type="secondary">
            Manage your organization general&apos;s settings
          </Typography.Text>
        </div>
      </div>

      <Card>
        <Form layout="vertical" onFinish={handleRename}>
          <Card.Content>
            <Typography.Title level={3}>Organization Name</Typography.Title>
            <br />
            <Form.Item
              extra={
                <div className={cls.desc}>
                  The organization is accessible at{' '}
                  <em>
                    https://app.specfy.io/<strong>{org.id}</strong>
                  </em>
                </div>
              }
            >
              <Input value={name} onChange={onName} disabled={org.isPersonal} />
            </Form.Item>
          </Card.Content>

          {!org.isPersonal && (
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
          )}
        </Form>
      </Card>

      {!org.isPersonal && (
        <Card padded>
          <div className={cls.actions}>
            <div>
              <Typography.Title level={4}>
                Delete this organization
              </Typography.Title>
              <Typography.Text type="secondary">
                Deleting an organization can&apos;t be undone.
              </Typography.Text>
            </div>
            <Button danger type="primary" onClick={showModal}>
              Delete Organization
            </Button>
          </div>
        </Card>
      )}

      <Modal
        title="Delete this organization?"
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
            Delete Organization
          </Button>,
        ]}
      >
        <p>
          Are you sure to delete this organization? <br></br>This action
          can&apos;t be undone.
        </p>
      </Modal>
    </>
  );
};
