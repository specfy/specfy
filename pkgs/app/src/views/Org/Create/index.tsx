import * as Form from '@radix-ui/react-form';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import type { FieldsErrors } from '@specfy/core';

import { createOrg, linkToGitHubOrg } from '@/api';
import { handleErrors, isError } from '@/api/helpers';
import { qcli } from '@/common/query';
import { socket } from '@/common/socket';
import { slugify, titleSuffix } from '@/common/string';
import { Card } from '@/components/Card';
import { ContainerChild } from '@/components/Container';
import { Flex } from '@/components/Flex';
import { Button } from '@/components/Form/Button';
import { Field } from '@/components/Form/Field';
import { Input } from '@/components/Form/Input';
import { GitHubButton, GitHubOrgSelect } from '@/components/GitHub/OrgSelect';
import { Header } from '@/components/Sidebar/Header';
import { Subdued } from '@/components/Text';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';

import cls from './index.module.scss';

const OrgCreate: React.FC = () => {
  const toast = useToast();
  const { tryLogin } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [id, setId] = useState<string>('');
  const [errors, setErrors] = useState<FieldsErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<number>(1);

  const [installId, setInstallId] = useState(0);

  const create = async (link: boolean = true) => {
    setLoading(true);
    const res = await createOrg({
      id,
      name,
    });
    if (isError(res)) {
      setLoading(false);
      return handleErrors(res, toast, setErrors);
    }

    setErrors({});
    toast.add({ title: 'Organization created', status: 'success' });
    if (link && installId) {
      await linkToGitHubOrg({
        installationId: installId!,
        orgId: res.data.id,
      });
    }
    await qcli.refetchQueries(['listOrgs']);
    setTimeout(() => {
      // Refresh permissions
      tryLogin();
      socket.emit('join', { orgId: res.data.id });
    }, 1);
    navigate(`/${res.data.id}`);
  };

  const onFinish1: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setStep(2);
  };
  const onFinish2: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    setStep(2);
    create();
  };

  return (
    <div>
      <Helmet title={`Create Organization ${titleSuffix}`} />

      <div style={{ width: '250px', position: 'absolute' }}>
        <Header />
      </div>
      <ContainerChild fullCenter>
        <Card large padded auto>
          {step === 1 && (
            <Form.Root
              onSubmit={onFinish1}
              className={cls.form}
              autoComplete="off"
            >
              <header>
                <h1>Create an Organization</h1>
                <p>
                  Host all your projects and documentation. The unique id
                  can&apos;t be changed later.
                </p>
              </header>
              <div className={cls.title}>
                <Field name="name" error={errors.name?.message}>
                  <Input
                    size="l"
                    placeholder="Name"
                    value={name}
                    className={cls.input}
                    autoFocus
                    onChange={(e) => {
                      setName(e.target.value);
                      const prevId = slugify(name);
                      if (id === prevId || id === '') {
                        setId(slugify(e.target.value));
                      }
                    }}
                  />
                </Field>
              </div>
              <Field name="unique" error={errors.id?.message}>
                <Input
                  placeholder="Unique ID"
                  value={id}
                  before="https://app.specify.io/"
                  seamless
                  onChange={(e) => setId(e.target.value)}
                />
              </Field>
              <Card.Actions>
                <Button
                  display="primary"
                  disabled={!name || name.length < 4 || !id || id.length < 4}
                  type="submit"
                >
                  Create
                </Button>
              </Card.Actions>
            </Form.Root>
          )}
          {step === 2 && (
            <Form.Root
              onSubmit={onFinish2}
              className={cls.form}
              autoComplete="off"
            >
              <header>
                <Flex justify="space-between">
                  <h1>Link to GitHub</h1>
                  <Button
                    display="ghost"
                    onClick={(e) => {
                      e.preventDefault();
                      create(false);
                    }}
                  >
                    <Subdued>skip</Subdued>
                  </Button>
                </Flex>
              </header>

              <Field name="name">
                <GitHubOrgSelect
                  as="list"
                  defaultSelected={''}
                  onChange={(sel) => {
                    if (sel) {
                      setInstallId(Number(sel));
                    }
                  }}
                />
              </Field>
              <Flex justify="space-between">
                <GitHubButton
                  hasInstall={true}
                  onRefresh={() => {
                    void qcli.refetchQueries(['getGitHubInstallations']);
                  }}
                />
                <Button
                  display="primary"
                  disabled={!installId}
                  type="submit"
                  loading={loading}
                >
                  Link
                </Button>
              </Flex>
            </Form.Root>
          )}
        </Card>
      </ContainerChild>
    </div>
  );
};

export default OrgCreate;
