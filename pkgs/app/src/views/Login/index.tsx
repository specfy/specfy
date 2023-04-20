import { IconApps } from '@tabler/icons-react';
import { App, Button, Form, Input } from 'antd';
import type { FieldsErrors } from 'api/src/types/api';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { authLocal } from '../../api/auth';
import { isError, isValidationError } from '../../api/helpers';
import { i18n } from '../../common/i18n';
import { Card } from '../../components/Card';
import Logo1 from '../../static/logo2.svg';

import cls from './index.module.scss';

export const Login: React.FC = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<FieldsErrors>({});

  const onFinish = async (values: { email: string; password: string }) => {
    const res = await authLocal(values);

    if (isError(res)) {
      if (isValidationError(res)) {
        setErrors(res.error.fields);
      } else {
        message.error(i18n.errorOccurred);
      }
      return;
    }

    navigate(`/`);
  };

  return (
    <div className={cls.container}>
      <div>
        <Link className={''} to="/" style={{ fontSize: '35px' }}>
          <span>
            <IconApps />
          </span>
          <img src={Logo1} />
        </Link>
        <Card padded>
          <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
            <Form.Item
              label="Email"
              name="email"
              required
              rules={[{ required: true, message: '' }]}
              help={errors.email?.message}
              validateStatus={errors.email && 'error'}
            >
              <Input type="email" placeholder="you@email.com" size="large" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: '' }]}
              required
              help={errors.password?.message}
              validateStatus={errors.password && 'error'}
            >
              <Input type="password" size="large" />
            </Form.Item>
            <Button type="primary" size="large" block htmlType="submit">
              Sign in
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
};
