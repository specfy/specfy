import * as Collapsible from '@radix-ui/react-collapsible';
import * as Form from '@radix-ui/react-form';
import {
  IconChevronDown,
  IconChevronRight,
  IconCircleArrowRight,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

import type { FieldsErrors } from '@specfy/core';
import type { ApiGitHubRepo, ApiOrg, ApiSource } from '@specfy/models';

import {
  createProject,
  createSource,
  getDefaultSettings,
  handleErrors,
  isError,
} from '@/api';
import { i18n } from '@/common/i18n';
import { socket } from '@/common/socket';
import { titleSuffix } from '@/common/string';
import { Banner } from '@/components/Banner';
import { Card } from '@/components/Card';
import { Container, ContainerChild } from '@/components/Container';
import { Flex } from '@/components/Flex';
import { Button } from '@/components/Form/Button';
import { Field } from '@/components/Form/Field';
import { SyncConfiguration } from '@/components/Project/SyncConfiguration';
import { GitHubSearch } from '@/components/StackSearch/GitHubSearch';
import { useToast } from '@/hooks/useToast';
import type { RouteOrg } from '@/types/routes';

import cls from './index.module.scss';

export const ProjectCreate: React.FC<{ org: ApiOrg; params: RouteOrg }> = ({
  org,
  params,
}) => {
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [repo, setRepo] = useState<ApiGitHubRepo>();
  const [errors, setErrors] = useState<FieldsErrors>({});
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<ApiSource['settings']>(() => {
    return getDefaultSettings();
  });

  const onFinish: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const res = await createProject({
      name,
      orgId: params.org_id,
    });
    if (isError(res)) {
      return handleErrors(res, toast, setErrors);
    }

    setErrors({});
    socket.emit('join', { orgId: params.org_id, projectId: res.data.id });

    toast.add({ title: 'Project created', status: 'success' });

    const hasGitHub = repo && repo.id !== -1;
    if (hasGitHub) {
      const link = await createSource({
        orgId: org.id,
        projectId: res.data.id,
        type: 'github',
        settings: settings!,
        identifier: repo.fullName,
      });
      if (isError(link)) {
        toast.add({ title: i18n.errorOccurred, status: 'error' });
        return;
      }
    }

    navigate(
      `/${params.org_id}/${res.data.slug}${hasGitHub ? '/welcome' : ''}`
    );
  };

  const onPickRepo: React.ComponentProps<typeof GitHubSearch>['onPick'] = (
    res
  ) => {
    setName(res.id !== -1 ? res.name : res.fullName);
    setRepo(res);
  };

  useEffect(() => {
    const keys = Object.keys(errors);
    if (keys.length > 1 || (keys.length === 1 && keys[0] !== 'name')) {
      setOpen(true);
    }
  }, [errors]);

  return (
    <Container noPadding>
      <Helmet title={`Create Project ${titleSuffix}`} />
      <ContainerChild centered>
        <Form.Root onSubmit={onFinish}>
          <div>
            {!org.githubInstallationId && (
              <>
                <Banner type="warning" size="s">
                  <Flex justify="space-between" grow>
                    <div>
                      Your organization is not linked to a GitHub organization.
                    </div>
                    <Link to={`/${org.id}/_/settings`}>
                      <Button display="default">Settings</Button>
                    </Link>
                  </Flex>
                </Banner>
                <br />
              </>
            )}
            <Card>
              <header className={cls.header}>
                <h1>Create a Project</h1>
                <p>
                  Contains your documentation and technical stack about a
                  product in your organization.
                </p>
              </header>

              <div className={cls.form}>
                <Flex align="flex-start" gap="l">
                  <Field name="name" error={errors.name?.message} key="fi">
                    <GitHubSearch
                      key="project"
                      installationId={org.githubInstallationId}
                      onPick={onPickRepo}
                    />
                  </Field>

                  <Form.Submit asChild>
                    <Button
                      size="l"
                      display="primary"
                      type="submit"
                      disabled={!repo}
                    >
                      Create <IconCircleArrowRight />
                    </Button>
                  </Form.Submit>
                </Flex>
              </div>
            </Card>
            <Collapsible.Root
              className={cls.advanced}
              open={open}
              onOpenChange={setOpen}
            >
              <Collapsible.Trigger asChild>
                <button>
                  Advanced {open ? <IconChevronDown /> : <IconChevronRight />}
                </button>
              </Collapsible.Trigger>

              <Collapsible.Content>
                <SyncConfiguration
                  errors={errors}
                  onChange={setSettings}
                  settings={settings}
                />
              </Collapsible.Content>
            </Collapsible.Root>
          </div>
        </Form.Root>
      </ContainerChild>
    </Container>
  );
};
