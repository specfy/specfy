import { GithubOutlined } from '@ant-design/icons';
import * as Form from '@radix-ui/react-form';
import type { FieldsErrors } from '@specfy/api/src/types/api';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';

import { authLocal } from '../../api/auth';
import { handleErrors, isError } from '../../api/helpers';
import { API_HOSTNAME } from '../../common/envs';
import { titleSuffix } from '../../common/string';
import { Card } from '../../components/Card';
import { Flex } from '../../components/Flex';
import { Button } from '../../components/Form/Button';
import { Field } from '../../components/Form/Field';
import { Input } from '../../components/Form/Input';
import { Logo } from '../../components/Logo';
import { useToast } from '../../hooks/useToast';

import cls from './index.module.scss';

export const Login: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<FieldsErrors>({});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onFinish: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const res = await authLocal({ email, password });

    if (isError(res)) {
      return handleErrors(res, toast, setErrors);
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
          <Button onClick={handleGithub} size="l" block>
            <GithubOutlined /> Sign in with Github
          </Button>
        </div>
        <Card padded>
          <Form.Root onSubmit={onFinish}>
            <Flex gap="l" column>
              <Field label="Email" name="email" error={errors.email?.message}>
                <Input
                  type="email"
                  placeholder="you@email.com"
                  size="l"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field
                label="Password"
                name="password"
                error={errors.password?.message}
              >
                <Input
                  type="password"
                  size="l"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Button display="primary" size="l" block type="submit">
                Sign in
              </Button>
            </Flex>
          </Form.Root>
        </Card>
      </div>
    </div>
  );
};
