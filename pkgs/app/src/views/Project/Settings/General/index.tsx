import * as Form from '@radix-ui/react-form';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import type { FieldsErrors } from '@specfy/core';
import type { ApiProject } from '@specfy/models';

import { deleteProject, updateProject } from '@/api';
import { handleErrors, isError } from '@/api/helpers';
import { useListKeys } from '@/api/keys';
import { API_HOSTNAME, IS_PROD } from '@/common/envs';
import { slugify, titleSuffix } from '@/common/string';
import { CopyButton } from '@/components/Button/Copy';
import { Card } from '@/components/Card';
import * as Dialog from '@/components/Dialog';
import { Flex } from '@/components/Flex';
import { Button } from '@/components/Form/Button';
import { Field } from '@/components/Form/Field';
import { Input } from '@/components/Form/Input';
import { Subdued } from '@/components/Text';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import type { RouteProject } from '@/types/routes';

import cls from './index.module.scss';

export const SettingsGeneral: React.FC<{
  proj: ApiProject;
  params: RouteProject;
}> = ({ proj, params }) => {
  const { currentPerm } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const canEdit = currentPerm?.role === 'owner';

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

  const handleRename: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const res = await updateProject(
      {
        project_id: proj.id,
        org_id: proj.orgId,
      },
      { name, slug }
    );
    if (isError(res)) {
      return handleErrors(res, toast, setErrors);
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
  const onOpenChange = (open: boolean) => {
    if (open) {
      setTimeout(() => setWaitToRead(false), 2000);
    } else {
      setWaitToRead(true);
    }
  };
  const confirmDelete = async () => {
    await deleteProject({
      project_id: proj.id,
      org_id: proj.orgId,
    });
    toast.add({ title: 'Project deleted', status: 'success' });

    navigate(`/${params.org_id}`);
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
          <h2>General Settings</h2>
          <Subdued>Manage your project general&apos;s settings</Subdued>
        </div>
      </div>

      <Card>
        <Form.Root onSubmit={handleRename} className={cls.main}>
          <Card.Content>
            <h4>Project Name</h4>
            <Field name="name" label="Name" error={errors.name?.message}>
              <Input
                value={name}
                onChange={onName}
                disabled={!canEdit}
                size="l"
                style={{ width: '400px' }}
              />
            </Field>
            <Field name="slug" label="Slug" error={errors.slug?.message}>
              <Input
                value={slug}
                onChange={onSlug}
                before={`https://app.specfy.io/${proj.orgId}/`}
                seamless
                disabled={!canEdit}
                style={{ width: '400px' }}
              />
            </Field>
          </Card.Content>

          {canEdit && (
            <Card.Actions>
              {nameChanged && (
                <Button display="ghost" onClick={handleReset}>
                  reset
                </Button>
              )}
              <Button display="primary" type="submit" disabled={!nameChanged}>
                Rename
              </Button>
            </Card.Actions>
          )}
        </Form.Root>
      </Card>

      {canEdit && (
        <Card>
          <Form.Root onSubmit={(e) => e.preventDefault()} className={cls.main}>
            <Card.Content>
              <h4>Keys</h4>
              <Flex gap="l" column align="flex-start">
                <Field name="project" label="Project ID">
                  <Input
                    readOnly
                    value={proj.id}
                    style={{ width: '350px' }}
                    seamless
                    after={<CopyButton value={proj.id} />}
                  />
                </Field>
                <Field name="apikey" label="Api Key">
                  <Input
                    readOnly
                    value={key || ''}
                    style={{ width: '350px' }}
                    seamless
                    after={
                      <CopyButton value={resKeys.data?.data[0].key || ''} />
                    }
                  />
                </Field>
                {!IS_PROD && (
                  <Field name="cli" label="Manual deploy command">
                    <Input
                      readOnly
                      value={manualCli}
                      style={{ width: '450px' }}
                      seamless
                      after={<CopyButton value={manualCli || ''} />}
                    />
                  </Field>
                )}
              </Flex>
            </Card.Content>
          </Form.Root>
        </Card>
      )}

      {canEdit && (
        <Card padded>
          <div className={cls.actions}>
            <div>
              <h4>Delete this project</h4>
              <p>Deleting a project can&apos;t be undone.</p>
            </div>

            <Dialog.Dialog onOpenChange={onOpenChange}>
              <Dialog.Trigger asChild>
                <Button danger>Delete Project</Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Delete this project?</Dialog.Title>
                </Dialog.Header>
                <Dialog.Description>
                  Are you sure to delete this project? <br></br>This operation
                  can&apos;t be undone.
                </Dialog.Description>
                <Dialog.Footer>
                  <Dialog.Close asChild>
                    <Button key="back" display="ghost">
                      cancel
                    </Button>
                  </Dialog.Close>
                  <Button
                    danger
                    key="submit"
                    display="primary"
                    disabled={waitToRead}
                    onClick={confirmDelete}
                    loading={waitToRead}
                  >
                    Delete Project
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            </Dialog.Dialog>
          </div>
        </Card>
      )}
    </>
  );
};
