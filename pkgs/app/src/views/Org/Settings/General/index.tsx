import * as Form from '@radix-ui/react-form';
import type { ApiOrg } from '@specfy/api/src/types/api';
import { IconCirclesRelation } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useLocalStorage } from 'react-use';

import { deleteOrg, updateOrg, linkToGithubOrg } from '../../../../api';
import { isError } from '../../../../api/helpers';
import { i18n } from '../../../../common/i18n';
import { titleSuffix } from '../../../../common/string';
import { Banner } from '../../../../components/Banner';
import { Card } from '../../../../components/Card';
import * as Dialog from '../../../../components/Dialog';
import { Button } from '../../../../components/Form/Button';
import { Field } from '../../../../components/Form/Field';
import { Input } from '../../../../components/Form/Input';
import { GithubOrgSelect } from '../../../../components/Github/OrgSelect';
import { Subdued } from '../../../../components/Text';
import { useAuth } from '../../../../hooks/useAuth';
import { useToast } from '../../../../hooks/useToast';
import type { RouteOrg } from '../../../../types/routes';

import cls from './index.module.scss';

export const SettingsGeneral: React.FC<{
  org: ApiOrg;
  params: RouteOrg;
}> = ({ org, params }) => {
  const { currentPerm } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [, setLastOrg] = useLocalStorage<string>('lastOrg');
  const canEdit = currentPerm?.role === 'owner';

  const [waitToRead, setWaitToRead] = useState(true);

  // Edit
  const [name, setName] = useState<string>();
  const onName: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setName(e.target.value);
  };
  const nameChanged = name !== org.name;

  const handleRename: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const res = await updateOrg(params, { name: name! });
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Organization renamed', status: 'success' });
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
  const onOpenChange = (open: boolean) => {
    if (open) {
      setTimeout(() => setWaitToRead(false), 2000);
    } else {
      setWaitToRead(true);
    }
  };

  const confirmDelete = async () => {
    const res = await deleteOrg(params);
    if (res !== 204) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Organization deleted', status: 'success' });
    setLastOrg(undefined);
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
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Organization linked to Github', status: 'success' });
  };
  const onUnlink = async () => {
    const res = await linkToGithubOrg({
      installationId: null,
      orgId: org.id,
    });
    if (isError(res)) {
      toast.add({ title: i18n.errorOccurred, status: 'error' });
      return;
    }

    toast.add({ title: 'Successfully unlinked', status: 'success' });
  };

  return (
    <>
      <Helmet title={`Settings - ${org.name} ${titleSuffix}`} />
      <div>
        <h2>General Settings</h2>

        <Subdued>Manage your organization general&apos;s settings</Subdued>

        {org.isPersonal && (
          <Banner type="info">
            This is your personal organization, some limitations apply.
          </Banner>
        )}
      </div>

      <Card>
        <Form.Root onSubmit={handleRename}>
          <Card.Content>
            <h3>Organization Name</h3>
            <br />
            <Field name="name">
              <Input
                value={name}
                onChange={onName}
                disabled={org.isPersonal || !canEdit}
              />
            </Field>
            <Subdued>
              The organization is accessible at{' '}
              <em>
                https://app.specfy.io/<strong>{org.id}</strong>
              </em>
            </Subdued>
          </Card.Content>

          {!org.isPersonal && canEdit && (
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
          <Form.Root onSubmit={(e) => e.preventDefault()}>
            <Card.Content>
              <h3>Link to Github</h3>
              <p>
                Linking to a Github organization will sync the avatar and enable
                automatic repository discovery.
              </p>

              <GithubOrgSelect
                key={org.githubInstallationId}
                defaultSelected={
                  org.githubInstallationId
                    ? String(org.githubInstallationId)
                    : ''
                }
                onChange={(sel) => {
                  if (sel) {
                    setInstallId(Number(sel));
                  }
                }}
              />
            </Card.Content>
            <Card.Actions>
              {org.githubInstallationId === installId && installId !== null ? (
                <Button onClick={onUnlink} danger>
                  Unlink
                </Button>
              ) : (
                <Button
                  display="primary"
                  disabled={org.githubInstallationId === installId}
                  onClick={onLink}
                >
                  <IconCirclesRelation /> Link
                </Button>
              )}
            </Card.Actions>
          </Form.Root>
        </Card>
      )}

      {!org.isPersonal && canEdit && (
        <Card padded>
          <div className={cls.actions}>
            <div>
              <h4>Delete this organization</h4>
              <Subdued>This operation can&apos;t be undone.</Subdued>
            </div>

            <Dialog.Dialog onOpenChange={onOpenChange}>
              <Dialog.Trigger asChild>
                <Button danger>Delete Organization</Button>
              </Dialog.Trigger>
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Delete this organization?</Dialog.Title>
                  <Dialog.Description>
                    Are you sure to delete this organization? <br></br>This
                    operation can&apos;t be undone.
                  </Dialog.Description>
                </Dialog.Header>
                <div></div>
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
                    Delete Organization
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
