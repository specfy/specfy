import * as Collapsible from '@radix-ui/react-collapsible';
import * as Form from '@radix-ui/react-form';
import type {
  ApiGithubRepo,
  ApiOrg,
  FieldsErrors,
} from '@specfy/api/src/types/api';
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
import { i18n } from '../../../common/i18n';
import { socket } from '../../../common/socket';
import { titleSuffix } from '../../../common/string';
import { Banner } from '../../../components/Banner';
import { Container } from '../../../components/Container';
import { Flex } from '../../../components/Flex';
import { Button } from '../../../components/Form/Button';
import { Checkbox } from '../../../components/Form/Checkbox';
import { Field, FieldCheckbox } from '../../../components/Form/Field';
import { Input } from '../../../components/Form/Input';
import { GithubSearch } from '../../../components/StackSearch/GithubSearch';
import { useToast } from '../../../hooks/useToast';
import type { RouteOrg } from '../../../types/routes';

import cls from './index.module.scss';

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
  const [stackEnabled, setStackEnabled] = useState(true);
  const [stackPath, setStackpath] = useState('/');
  const [docEnabled, setDocEnabled] = useState(true);
  const [docPath, setDocPath] = useState('/docs');

  const onFinish: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const res = await createProject({
      name,
      orgId: params.org_id,
      config: {
        documentation: {
          enabled: docEnabled,
          path: docPath,
        },
        stack: {
          enabled: stackEnabled,
          path: stackPath,
        },
      },
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
    setName(res.name);
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
            <Banner type="info">
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
              <Flex
                className={cls.inner}
                column
                gap="2xl"
                align="flex-start"
                grow
              >
                <Flex align="flex-start" gap="xl" grow>
                  <Flex column align="flex-start">
                    <strong>Stack</strong>
                    <p className={cls.desc}>
                      Automatically analyze and upload your stack
                    </p>
                  </Flex>
                  <Flex
                    column
                    align="flex-start"
                    gap="l"
                    grow
                    className={cls.inputs}
                  >
                    <Flex gap="l">
                      <FieldCheckbox name="checkStackEnabled" label="Enabled">
                        <Checkbox
                          checked={stackEnabled}
                          onCheckedChange={() => setStackEnabled(!stackEnabled)}
                        />
                      </FieldCheckbox>
                    </Flex>

                    <Field
                      name="stackPath"
                      label="Path"
                      error={errors.stackPath?.message}
                    >
                      <Input
                        type="text"
                        value={stackPath}
                        onChange={(e) => setStackpath(e.target.value)}
                        disabled={!stackEnabled}
                        placeholder="Path to analyze, e.g: '/'"
                      />
                    </Field>
                  </Flex>
                </Flex>

                <Flex align="flex-start" gap="xl" grow>
                  <Flex column align="flex-start">
                    <strong>Documentation</strong>
                    <p className={cls.desc}>Upload your markdown files</p>
                  </Flex>
                  <Flex
                    column
                    align="flex-start"
                    gap="l"
                    grow
                    className={cls.inputs}
                  >
                    <FieldCheckbox name="checkDocEnabled" label="Enabled">
                      <Checkbox
                        checked={docEnabled}
                        onCheckedChange={() => setDocEnabled(!docEnabled)}
                      />
                    </FieldCheckbox>
                    <Field
                      name="docPath"
                      label="Path"
                      error={errors.docPath?.message}
                    >
                      <Input
                        type="text"
                        value={docPath}
                        onChange={(e) => setDocPath(e.target.value)}
                        disabled={!docEnabled}
                        placeholder="Path to analyze, e.g: '/'"
                      />
                    </Field>
                  </Flex>
                </Flex>
              </Flex>
            </Collapsible.Content>
          </Collapsible.Root>
        </Form.Root>
      </Container.Left2Third>
    </Container>
  );
};
