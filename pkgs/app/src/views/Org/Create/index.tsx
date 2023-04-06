import { IconCircleArrowRight } from '@tabler/icons-react';
import { App, Button, Form, Input, Typography } from 'antd';
import type { FieldsErrors } from 'api/src/types/api';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { createOrg } from '../../../api';
import { isError, isValidationError } from '../../../api/helpers';
import { i18n } from '../../../common/i18n';
import { slugify } from '../../../common/string';

import cls from './index.module.scss';

export const OrgCreate: React.FC = () => {
  const { message } = App.useApp();
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
        message.error(i18n.errorOccurred);
      }
      return;
    }

    message.success('Organization created');
    navigate(`/${res.id}`);
  };

  return (
    <form onSubmit={onFinish} className={cls.form}>
      <Typography.Title level={4}>Create Organization</Typography.Title>
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
              if (id === prevId) {
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
          icon={<IconCircleArrowRight />}
        ></Button>
      </div>
      <Form.Item
        className={cls.wrap}
        help={errors.id?.message}
        validateStatus={errors.id && 'error'}
      >
        <Input
          placeholder="Unique ID"
          value={id}
          addonBefore="https://specify.io/"
          onChange={(e) => setId(e.target.value)}
        />
      </Form.Item>
    </form>
  );
};
