import type { FieldsErrors } from '@specfy/api/src/types/api';
import { IconCircleArrowRight } from '@tabler/icons-react';
import { Button, Form, Input } from 'antd';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

import { createOrg } from '../../../api';
import { isError, isValidationError } from '../../../api/helpers';
import { i18n } from '../../../common/i18n';
import { slugify, titleSuffix } from '../../../common/string';
import { Card } from '../../../components/Card';
import { useToast } from '../../../hooks/useToast';

import cls from './index.module.scss';

export const OrgCreate: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [id, setId] = useState<string>('');
  const [errors, setErrors] = useState<FieldsErrors>({});

  const onFinish: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const res = await createOrg({
      id,
      name,
    });
    if (isError(res)) {
      if (isValidationError(res)) {
        setErrors(res.error.fields);
      } else {
        toast.add({ title: i18n.errorOccurred, status: 'error' });
      }
      return;
    }

    setErrors({});
    toast.add({ title: 'Organization created', status: 'success' });
    navigate(`/${res.id}`);
  };

  return (
    <div className={cls.container}>
      <Helmet title={`Create Organization ${titleSuffix}`} />
      <Card large padded>
        <form onSubmit={onFinish} className={cls.form}>
          <header>
            <h1>Create an Organization</h1>
            <p>
              Host all your projects and documentation. The unique id can&apos;t
              be changed later.
            </p>
          </header>
          <div className={cls.title}>
            <Form.Item
              className={cls.wrap}
              help={errors.name?.message}
              validateStatus={errors.name && 'error'}
            >
              <Input
                size="large"
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
            </Form.Item>
            <Button
              type="primary"
              disabled={!name || name.length < 4 || !id || id.length < 4}
              className={cls.button}
              htmlType="submit"
            >
              Create <IconCircleArrowRight />
            </Button>
          </div>
          <Form.Item
            className={cls.wrap}
            help={errors.id?.message}
            validateStatus={errors.id && 'error'}
          >
            <Input
              placeholder="Unique ID"
              value={id}
              addonBefore="https://app.specify.io/"
              onChange={(e) => setId(e.target.value)}
            />
          </Form.Item>
        </form>
      </Card>
    </div>
  );
};
