import * as Form from '@radix-ui/react-form';
import { IconCircleArrowRight } from '@tabler/icons-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import type { FieldsErrors } from '@specfy/core';

import { createOrg } from '@/api';
import { handleErrors, isError } from '@/api/helpers';
import { qcli } from '@/common/query';
import { socket } from '@/common/socket';
import { slugify, titleSuffix } from '@/common/string';
import { Card } from '@/components/Card';
import { ContainerChild } from '@/components/Container';
import { Button } from '@/components/Form/Button';
import { Field } from '@/components/Form/Field';
import { Input } from '@/components/Form/Input';
import { Header } from '@/components/Sidebar/Header';
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

  const onFinish: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    setLoading(true);
    const res = await createOrg({
      id,
      name,
    });
    setLoading(false);
    if (isError(res)) {
      return handleErrors(res, toast, setErrors);
    }

    setErrors({});
    toast.add({ title: 'Organization created', status: 'success' });
    await qcli.refetchQueries(['listOrgs']);
    setTimeout(() => {
      // Refresh permissions
      tryLogin();
      socket.emit('join', { orgId: res.data.id });
    }, 1);
    navigate(`/${res.data.id}`);
  };

  return (
    <div>
      <Helmet title={`Create Organization ${titleSuffix}`} />

      <div style={{ width: '250px', position: 'absolute' }}>
        <Header />
      </div>
      <ContainerChild fullCenter>
        <Card large padded auto>
          <Form.Root
            onSubmit={onFinish}
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
              <Button
                display="primary"
                disabled={!name || name.length < 4 || !id || id.length < 4}
                className={cls.button}
                type="submit"
                size="xl"
                loading={loading}
              >
                Create <IconCircleArrowRight />
              </Button>
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
          </Form.Root>
        </Card>
      </ContainerChild>
    </div>
  );
};

export default OrgCreate;
