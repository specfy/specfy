import { GithubOutlined } from '@ant-design/icons';
import type { FieldsErrors } from '@specfy/api/src/types/api';
import { Button, Form, Input } from 'antd';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

import { authLocal } from '../../api/auth';
import { isError, isValidationError } from '../../api/helpers';
import { API_HOSTNAME } from '../../common/envs';
import { i18n } from '../../common/i18n';
import { titleSuffix } from '../../common/string';
import { Card } from '../../components/Card';
import { Logo } from '../../components/Logo';
import { useToast } from '../../hooks/useToast';

import cls from './index.module.scss';

export const Login: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<FieldsErrors>({});

  const onFinish = async (values: { email: string; password: string }) => {
    const res = await authLocal(values);

    if (isError(res)) {
      if (isValidationError(res)) {
        setErrors(res.error.fields);
      } else {
        toast.add({ title: i18n.errorOccurred, status: 'error' });
      }
      return;
    }
    setErrors({});
    navigate(`/`);
  };

  const handleGithub = () => {
    window.location.replace(`${API_HOSTNAME}/0/auth/github`);
  };

  return (
    <div className={cls.container}>
      <Helmet title={`Login ${titleSuffix}`} />
      <div>
        <Link className={cls.logo} to="/">
          <Logo />
        </Link>
        <div className={cls.oauth}>
          <Button
            onClick={handleGithub}
            icon={<GithubOutlined />}
            size="large"
            block
          >
            Sign in with Github
          </Button>
        </div>
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
