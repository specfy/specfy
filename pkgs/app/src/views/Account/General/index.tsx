import { Typography, Input, Button, Modal, App, Form } from 'antd';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { deleteMe, updateMe } from '../../../api';
import { isError } from '../../../api/helpers';
import { i18n } from '../../../common/i18n';
import { titleSuffix } from '../../../common/string';
import { Card } from '../../../components/Card';
import { useAuth } from '../../../hooks/useAuth';

import cls from './index.module.scss';

export const SettingsGeneral: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { user, tryLogin } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waitToRead, setWaitToRead] = useState(true);

  // Edit
  const me = user!;
  const [name, setName] = useState(() => me.name);
  const [email] = useState(() => me.email);
  const onName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setName(e.target.value);
  };

  const handleRename = async () => {
    const res = await updateMe({ name });
    if (isError(res)) {
      void message.error(i18n.errorOccurred);
      return;
    }

    tryLogin();
    void message.success('Account renamed');
  };
  const handleReset = () => {
    setName(me.name);
  };

  const changed = useMemo(() => {
    return name !== me.name || email !== me.email;
  }, [name, email]);

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
    const res = await deleteMe();
    if (res !== 204) {
      void message.error(i18n.errorOccurred);
      return;
    }

    void message.success('Account deleted');
    navigate(`/login`);
  };

  return (
    <>
      <Helmet title={`Account ${titleSuffix}`} />
      <div>
        <div>
          <Typography.Title level={2}>General Settings</Typography.Title>
          <Typography.Text type="secondary">
            Manage your account general&apos;s settings
          </Typography.Text>
        </div>
      </div>

      <Card>
        <Form layout="vertical" onFinish={handleRename}>
          <Card.Content>
            <Form.Item label="Display Name">
              <Input value={name} onChange={onName} />
            </Form.Item>
            <Form.Item label="Email">
              <Input value={email} onChange={onName} disabled />
            </Form.Item>
          </Card.Content>

          <Card.Actions>
            {changed && (
              <Button type="text" onClick={handleReset}>
                reset
              </Button>
            )}
            <Button type="primary" htmlType="submit" disabled={!changed}>
              Update
            </Button>
          </Card.Actions>
        </Form>
      </Card>

      <Card padded>
        <div className={cls.actions}>
          <div>
            <Typography.Title level={4}>Delete your account</Typography.Title>
            <Typography.Text type="secondary">
              This operation can&apos;t be undone.
            </Typography.Text>
          </div>
          <Button danger type="default" onClick={showModal}>
            Delete Account
          </Button>
        </div>
      </Card>

      <Modal
        title="Delete your account?"
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
            Delete Account
          </Button>,
        ]}
      >
        <p>
          Are you sure to delete your account? <br></br>This operation
          can&apos;t be undone.
        </p>
      </Modal>
    </>
  );
};
