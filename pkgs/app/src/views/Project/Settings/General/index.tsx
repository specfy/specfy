import type { ApiProject, FieldsErrors } from '@specfy/api/src/types/api';
import { IconCirclesRelation } from '@tabler/icons-react';
import { Typography, Input, Button, Modal, Form } from 'antd';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

import {
  deleteProject,
  updateProject,
  linkToGithubRepo,
} from '../../../../api';
import { isError, isValidationError } from '../../../../api/helpers';
import { useListKeys } from '../../../../api/keys';
import { API_HOSTNAME, IS_PROD } from '../../../../common/envs';
import { i18n } from '../../../../common/i18n';
import { useOrgStore } from '../../../../common/store';
import { slugify, titleSuffix } from '../../../../common/string';
import { Banner } from '../../../../components/Banner';
import { CopyButton } from '../../../../components/Button/Copy';
import { Card } from '../../../../components/Card';
import { Flex } from '../../../../components/Flex';
import { GithubOrgSelect } from '../../../../components/Github/OrgSelect';
import { GithubRepoSelect } from '../../../../components/Github/RepoSelect';
import { useToast } from '../../../../hooks/useToast';
import type { RouteProject } from '../../../../types/routes';

import cls from './index.module.scss';

export const SettingsGeneral: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const { current: org } = useOrgStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [waitToRead, setWaitToRead] = useState(true);

  // Edit
  const [name, setName] = useState(() => proj.name);
  const [slug, setSlug] = useState(() => proj.slug);
  const [errors, setErrors] = useState<FieldsErrors>({});
  const onName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setName(e.target.value);
    const prev = slugify(name);
    if (slug === prev || slug === '') {
      setSlug(slugify(e.target.value));
    }
  };
  const onSlug: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setSlug(slugify(e.target.value));
  };
  const nameChanged = useMemo(() => {
    return name !== proj.name || slug !== proj.slug;
  }, [name, slug]);

  const handleRename = async () => {
    const res = await updateProject(params, { name, slug });
    if (isError(res)) {
      if (isValidationError(res)) {
        setErrors(res.error.fields);
      } else {
        toast.add({ title: i18n.errorOccurred, status: 'error' });
      }
      return;
    }

    setErrors({});
    toast.add({ title: 'Project renamed', status: 'success' });
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
    toast.add({ title: 'Project deleted', status: 'success' });

    navigate(`/${params.org_id}`);
  };

  // Github
  const [repoId, setRepoId] = useState(proj.githubRepository);

  const onLink = async () => {
    const res = await linkToGithubRepo({
      orgId: proj.orgId,
      projectId: proj.id,
      repository: repoId,
    });
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Project linked to Github', status: 'success' });
  };

  const onUnlink = async () => {
    const res = await linkToGithubRepo({
      orgId: proj.orgId,
      projectId: proj.id,
      repository: null,
    });
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Successfully unlinked', status: 'success' });
  };

  // Keys
  const resKeys = useListKeys({
    org_id: proj.orgId,
    project_id: proj.id,
  });
  const key = useMemo<string | null>(() => {
    if (!resKeys.data || resKeys.data.data.length === 0) {
      return null;
    }

    return '•'.repeat(resKeys.data.data[0].key.length);
  }, [resKeys]);

  const manualCli = useMemo<string>(() => {
    return `SPECFY_HOSTNAME=${API_HOSTNAME.replace(
      'localhost',
      '127.0.0.1'
    )} node ./dist/cli.js run -d docs -s / -o ${proj.orgId} -p ${proj.id} -t ${
      resKeys.data?.data[0].key
    }`;
  }, [resKeys]);

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
              help={errors.name?.message}
              validateStatus={errors.name && 'error'}
            >
              <Input value={name} onChange={onName} />
            </Form.Item>
            <Form.Item
              label="Slug"
              help={errors.slug?.message}
              validateStatus={errors.slug && 'error'}
            >
              <Input
                value={slug}
                onChange={onSlug}
                addonBefore={`https://app.specfy.io/${proj.orgId}/`}
              />
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

      <Card>
        <Form layout="vertical" onFinish={handleRename}>
          <Card.Content>
            <Typography.Title level={3}>Link to Github</Typography.Title>
            <p>
              Linking to a Github repository enables automatic deployment when
              you push to your repository.
            </p>

            {!org!.githubInstallationId ? (
              <Banner type="info">
                <Flex justify="space-between">
                  First, link your Specfy organization to a Github organization.
                  <Link to={`/${org!.id}/_/settings`}>
                    <Button>Settings</Button>
                  </Link>
                </Flex>
              </Banner>
            ) : (
              <Flex gap="l">
                <GithubOrgSelect
                  onChange={() => null}
                  defaultSelected={org!.githubInstallationId}
                  disabled
                />
                <GithubRepoSelect
                  defaultSelected={proj.githubRepository}
                  installationId={org!.githubInstallationId}
                  onChange={setRepoId}
                />
              </Flex>
            )}
          </Card.Content>
          <Card.Actions>
            {proj.githubRepository === repoId && repoId !== null ? (
              <Button type="default" onClick={onUnlink} danger>
                Unlink
              </Button>
            ) : (
              <Button
                type="primary"
                disabled={proj.githubRepository === repoId}
                onClick={onLink}
              >
                <IconCirclesRelation /> Link
              </Button>
            )}
          </Card.Actions>
        </Form>
      </Card>

      <Card>
        <Form layout="vertical" onFinish={handleRename}>
          <Card.Content>
            <Typography.Title level={3}>Keys</Typography.Title>
            <Flex gap="l" column align="flex-start">
              <div>
                <div>Project ID</div>
                <Input
                  readOnly
                  value={proj.id}
                  style={{ width: '350px' }}
                  suffix={<CopyButton value={proj.id} />}
                />
              </div>
              <div>
                <div>Api Key</div>
                <Input
                  readOnly
                  value={key || ''}
                  style={{ width: '350px' }}
                  suffix={
                    <CopyButton value={resKeys.data?.data[0].key || ''} />
                  }
                />
              </div>
              {!IS_PROD && (
                <div>
                  <div>Manual deploy command</div>
                  <Input
                    readOnly
                    value={manualCli}
                    style={{ width: '350px' }}
                    suffix={<CopyButton value={manualCli || ''} />}
                  />
                </div>
              )}
            </Flex>
          </Card.Content>
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
