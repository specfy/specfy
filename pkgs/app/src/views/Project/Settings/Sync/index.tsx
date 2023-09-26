import * as Form from '@radix-ui/react-form';
import { IconCirclesRelation } from '@tabler/icons-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

import type { FieldsErrors } from '@specfy/core';
import type { ApiProject } from '@specfy/models';

import { linkToGitHubRepo, updateProject } from '@/api';
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
  const [config, setConfig] = useState<ApiProject['config']>();

  const [repoId, setRepoId] = useState<string | undefined>(
    proj.githubRepository ?? undefined
  );

  const onLink = async () => {
    const res = await linkToGitHubRepo({
      orgId: proj.orgId,
      projectId: proj.id,
      repository: repoId || null,
    });
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Project linked to GitHub', status: 'success' });
  };

  const onUnlink = async () => {
    const res = await linkToGitHubRepo({
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

  const onSaveConfiguration: React.FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();
    const res = await updateProject(
      { org_id: proj.orgId, project_id: proj.id },
      { config }
    );
    if (isError(res)) {
      return handleErrors(res, toast, setErrors);
    }

    setErrors({});
    toast.add({ title: 'Configuration updated', status: 'success' });
  };

  return (
    <>
      <Helmet title={`Settings - ${proj.name} ${titleSuffix}`} />

      <div>
        <div>
          <h2>GitHub Sync</h2>
          <Subdued>Manage your project sync&apos;s settings</Subdued>
        </div>
      </div>

      <Card>
        <Form.Root onSubmit={(e) => e.preventDefault()} className={cls.main}>
          <Card.Content>
            <h4>Link to GitHub</h4>

            <Field name="github">
              {!org!.githubInstallationId ? (
                <Banner type="info">
                  <Flex justify="space-between">
                    First, link your Specfy organization to a GitHub
                    organization.
                    <Link to={`/${org!.id}/_/settings`}>
                      <Button>Settings</Button>
                    </Link>
                  </Flex>
                </Banner>
              ) : (
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
                      proj.githubRepository
                        ? String(proj.githubRepository)
                        : undefined
                    }
                    installationId={org!.githubInstallationId}
                    onChange={setRepoId}
                  />
                </Flex>
              )}
            </Field>
            <p>
              Linking to a GitHub repository enables automatic deployment when
              you push to your repository.
            </p>
          </Card.Content>
          <Card.Actions>
            {proj.githubRepository === repoId && repoId !== null ? (
              <Button display="default" onClick={onUnlink} danger>
                Unlink
              </Button>
            ) : (
              <Button
                display="primary"
                disabled={proj.githubRepository === repoId}
                onClick={onLink}
              >
                <IconCirclesRelation /> Link
              </Button>
            )}
          </Card.Actions>
        </Form.Root>
      </Card>

      <Card>
        <Form.Root onSubmit={onSaveConfiguration} className={cls.main}>
          <Card.Content>
            <h4>Configuration</h4>
            <SyncConfiguration
              errors={errors}
              config={proj.config}
              onChange={setConfig}
            />
          </Card.Content>
          <Card.Actions>
            <Button display="primary">Save</Button>
          </Card.Actions>
        </Form.Root>
      </Card>
    </>
  );
};
