import * as Form from '@radix-ui/react-form';
import { IconCirclesRelation } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import type { FieldsErrors } from '@specfy/core';
import type { ApiProject, ApiSource } from '@specfy/models';

import {
  createSource,
  deleteSource,
  getDefaultSettings,
  updateSource,
  useListSources,
} from '@/api';
import { handleErrors, isError } from '@/api/helpers';
import { i18n } from '@/common/i18n';
import { useOrgStore } from '@/common/store';
import { titleSuffix } from '@/common/string';
import { Banner } from '@/components/Banner';
import { Card } from '@/components/Card';
import { Flex } from '@/components/Flex';
import { Button } from '@/components/Form/Button';
import { Field } from '@/components/Form/Field';
import { GitHubOrgSelect } from '@/components/GitHub/OrgSelect';
import { GitHubRepoSelect } from '@/components/GitHub/RepoSelect';
import { Loading } from '@/components/Loading';
import { SyncConfiguration } from '@/components/Project/SyncConfiguration';
import { Subdued } from '@/components/Text';
import { useToast } from '@/hooks/useToast';

import cls from './index.module.scss';

export const SettingsSync: React.FC<{
  proj: ApiProject;
}> = ({ proj }) => {
  const toast = useToast();
  const { current: org } = useOrgStore();
  const [errors, setErrors] = useState<FieldsErrors>({});
  const [settings, setSettings] = useState<ApiSource['settings'] | undefined>();
  const list = useListSources({ org_id: proj.orgId, project_id: proj.id });
  const [source, setSource] = useState<ApiSource | undefined>();
  const [repoId, setRepoId] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!list.data) {
      return;
    }

    if (list.data.data.length > 0) {
      setSource(list.data.data[0]);
      setSettings(list.data.data[0].settings);
    } else {
      setSettings(getDefaultSettings());
    }
  }, [list.data]);

  const onLink = async () => {
    setLoading(true);
    const res = await createSource({
      orgId: proj.orgId,
      projectId: proj.id,
      type: 'github',
      identifier: repoId!,
      settings: settings!,
    });
    setLoading(false);
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Project linked to GitHub', status: 'success' });
  };

  const onUnlink = async () => {
    setLoading(true);
    const res = await deleteSource({
      org_id: proj.orgId,
      project_id: proj.id,
      source_id: source!.id,
    });
    setLoading(false);
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Successfully unlinked', status: 'success' });
    setSource(undefined);
    setSettings(getDefaultSettings());
  };

  const onSaveSettings: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateSource(
      { org_id: proj.orgId, project_id: proj.id, source_id: source!.id },
      { name: `GitHub ${repoId}`, settings: settings! }
    );
    setLoading(false);
    if (isError(res)) {
      return handleErrors(res, toast, setErrors);
    }

    setErrors({});
    toast.add({ title: 'Settings updated', status: 'success' });
  };

  if (!list.data) {
    return <Loading />;
  }

  return (
    <>
      <Helmet title={`Settings - ${proj.name} ${titleSuffix}`} />

      <div>
        <div>
          <h2>GitHub Sync</h2>
          <Subdued>Manage your project sync&apos;s settings</Subdued>
        </div>
      </div>

      {!org!.githubInstallationId && (
        <Banner type="info">
          <Flex justify="space-between">
            To use this link your Specfy organization to a GitHub organization.
            <Link to={`/${org!.id}/_/settings`}>
              <Button>Settings</Button>
            </Link>
          </Flex>
        </Banner>
      )}

      <Card>
        <Form.Root onSubmit={(e) => e.preventDefault()} className={cls.main}>
          <Card.Content>
            <h4>Connect to GitHub</h4>
            <p>
              Connecting a GitHub repository to your project enables automatic
              deployment when you push to your repository, keeping your stack
              always up-to-date.
            </p>
            <br />

            <Field name="github">
              {org!.githubInstallationId && (
                <Flex gap="l">
                  <GitHubOrgSelect
                    onChange={() => null}
                    defaultSelected={
                      org!.githubInstallationId
                        ? String(org!.githubInstallationId)
                        : undefined
                    }
                    disabled
                  />
                  <GitHubRepoSelect
                    value={
                      source?.identifier
                        ? String(source?.identifier)
                        : undefined
                    }
                    disabled={Boolean(source)}
                    installationId={org!.githubInstallationId}
                    onChange={setRepoId}
                  />
                  {source && source.identifier === repoId ? (
                    <Button
                      display="default"
                      onClick={onUnlink}
                      danger
                      loading={loading}
                    >
                      Unlink
                    </Button>
                  ) : (
                    <Button
                      display="primary"
                      onClick={onLink}
                      disabled={!repoId}
                      loading={loading}
                    >
                      <IconCirclesRelation /> Link
                    </Button>
                  )}
                </Flex>
              )}
            </Field>
          </Card.Content>
        </Form.Root>
      </Card>

      <Form.Root onSubmit={onSaveSettings} className={cls.main}>
        <Flex gap="2xl" column grow>
          <Card>
            <Card.Content>
              <h4>Settings</h4>
              {settings && (
                <SyncConfiguration
                  errors={errors}
                  settings={settings}
                  onChange={setSettings}
                />
              )}
            </Card.Content>
            <Card.Actions>
              {source && (
                <Button display="primary" loading={loading}>
                  Save
                </Button>
              )}
            </Card.Actions>
          </Card>
        </Flex>
      </Form.Root>
    </>
  );
};
