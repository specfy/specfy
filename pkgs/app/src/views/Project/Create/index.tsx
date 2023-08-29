import * as Collapsible from '@radix-ui/react-collapsible';
import * as Form from '@radix-ui/react-form';
import type { FieldsErrors } from '@specfy/core';
import type { ApiProject, ApiGithubRepo, ApiOrg } from '@specfy/models';
import {
  IconChevronDown,
  IconChevronRight,
  IconCircleArrowRight,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

import { createProject, linkToGithubRepo } from '../../../api';
import { handleErrors, isError } from '../../../api/helpers';
import { Banner } from '../../../components/Banner';
import { Container } from '../../../components/Container';
import { Flex } from '../../../components/Flex';
import { Button } from '../../../components/Form/Button';
import { Field } from '../../../components/Form/Field';
import { SyncConfiguration } from '../../../components/Project/SyncConfiguration';
import { GithubSearch } from '../../../components/StackSearch/GithubSearch';
import { useToast } from '../../../hooks/useToast';
import type { RouteOrg } from '../../../types/routes';

import cls from './index.module.scss';

import { i18n } from '@/common/i18n';
import { socket } from '@/common/socket';
import { titleSuffix } from '@/common/string';

export const ProjectCreate: React.FC<{ org: ApiOrg; params: RouteOrg }> = ({
  org,
  params,
}) => {
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [repo, setRepo] = useState<ApiGithubRepo>();
  const [errors, setErrors] = useState<FieldsErrors>({});
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ApiProject['config']>();

  const onFinish: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const res = await createProject({
      name,
      orgId: params.org_id,
      config,
    });
    if (isError(res)) {
      return handleErrors(res, toast, setErrors);
    }

    setErrors({});
    socket.emit('join', { orgId: params.org_id, projectId: res.data.id });

    toast.add({ title: 'Project created', status: 'success' });

    if (repo && repo.id !== -1) {
      const link = await linkToGithubRepo({
        orgId: org.id,
        projectId: res.data.id,
        repository: repo.fullName,
      });
      if (isError(link)) {
        toast.add({ title: i18n.errorOccurred, status: 'error' });
        return;
      }
    }

    navigate(`/${params.org_id}/${res.data.slug}`);
  };

  const onPickRepo: React.ComponentProps<typeof GithubSearch>['onPick'] = (
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
      <Container.Left2Third>
        <header className={cls.header}>
          <h1>Create a Project</h1>
          <p>
            Contains your documentation and technical stack about a product in
            your organization.
          </p>
        </header>

        <Form.Root onSubmit={onFinish} className={cls.form}>
          <Flex align="flex-start" gap="l">
            <Field name="name" error={errors.name?.message} key="fi">
              <GithubSearch
                key="project"
                installationId={org.githubInstallationId}
                onPick={onPickRepo}
              />
            </Field>

            <Form.Submit asChild>
              <Button size="l" display="primary" type="submit" disabled={!repo}>
                Create <IconCircleArrowRight />
              </Button>
            </Form.Submit>
          </Flex>

          {!org.githubInstallationId && (
            <Banner type="warning">
              <Flex justify="space-between" grow>
                <div>
                  Your organization is not linked to a Github organization.
                </div>
                <Link to={`/${org.id}/_/settings`}>
                  <Button display="default">Settings</Button>
                </Link>
              </Flex>
            </Banner>
          )}

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
              <SyncConfiguration errors={errors} onChange={setConfig} />
            </Collapsible.Content>
          </Collapsible.Root>
        </Form.Root>
      </Container.Left2Third>
    </Container>
  );
};
