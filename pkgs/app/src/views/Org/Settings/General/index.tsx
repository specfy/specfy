import type { ApiOrg } from '@specfy/api/src/types/api';
import { IconCirclesRelation } from '@tabler/icons-react';
import { Typography, Input, Button, Modal, App, Form } from 'antd';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { deleteOrg, updateOrg, linkToGithubOrg } from '../../../../api';
import { isError } from '../../../../api/helpers';
import { i18n } from '../../../../common/i18n';
import { titleSuffix } from '../../../../common/string';
import { Banner } from '../../../../components/Banner';
import { Card } from '../../../../components/Card';
import { GithubOrgSelect } from '../../../../components/Github/OrgSelect';
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
  const [name, setName] = useState<string>();
  const onName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setName(e.target.value);
  };
  const nameChanged = name !== org.name;

  const handleRename = async () => {
    const res = await updateOrg(params, { name: name! });
    if (isError(res)) {
      void message.error(i18n.errorOccurred);
      return;
    }

    void message.success('Organization renamed');
  };
  const handleReset = () => {
    setName(org.name);
  };
  useEffect(() => {
    if (name !== org.name) {
      setName(org.name);
    }
  }, [org.name]);

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
      void message.error(i18n.errorOccurred);
      return;
    }

    void message.success('Organization deleted');
    navigate(`/`);
  };

  // Github
  const [installId, setInstallId] = useState(org.githubInstallationId);

  const onLink = async () => {
    const res = await linkToGithubOrg({
      installationId: installId!,
      orgId: org.id,
    });
    if (isError(res)) {
      void message.error(i18n.errorOccurred);
      return;
    }

    void message.success('Linked successfully');
  };
  const onUnlink = async () => {
    const res = await linkToGithubOrg({
      installationId: null,
      orgId: org.id,
    });
    if (isError(res)) {
      void message.error(i18n.errorOccurred);
      return;
    }

    void message.success('Unlinked successfully');
  };

  return (
    <>
      <Helmet title={`Settings - ${org.name} ${titleSuffix}`} />
      <div>
        <h2>General Settings</h2>

        <Typography.Text type="secondary">
          Manage your organization general&apos;s settings
        </Typography.Text>

        {org.isPersonal && (
          <Banner type="info">
            This is your personal organization, some limitations apply.
          </Banner>
        )}
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

      <Card>
        <Form layout="vertical" onFinish={handleRename}>
          <Card.Content>
            <Typography.Title level={3}>Link to Github</Typography.Title>
            <p>
              Linking to a Github organization will sync the avatar and enable
              automatic repository discovery.
            </p>

            <GithubOrgSelect
              key={org.githubInstallationId}
              emptyOption={true}
              defaultSelected={org.githubInstallationId}
              onChange={(sel) => {
                setInstallId(sel);
              }}
            />
          </Card.Content>
          <Card.Actions>
            {org.githubInstallationId === installId && installId !== null ? (
              <Button type="default" onClick={onUnlink} danger>
                Unlink
              </Button>
            ) : (
              <Button
                type="primary"
                disabled={org.githubInstallationId === installId}
                onClick={onLink}
              >
                <IconCirclesRelation /> Link
              </Button>
            )}
          </Card.Actions>
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
                This operation can&apos;t be undone.
              </Typography.Text>
            </div>
            <Button danger type="default" onClick={showModal}>
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
          Are you sure to delete this organization? <br></br>This operation
          can&apos;t be undone.
        </p>
      </Modal>
    </>
  );
};
