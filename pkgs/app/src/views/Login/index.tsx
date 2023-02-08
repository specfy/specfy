import { AppstoreAddOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input } from 'antd';
import { Link } from 'react-router-dom';
import { useMount } from 'react-use';

import { useAuth } from '../../hooks/useAuth';
import Logo1 from '../../static/logo2.svg';

import cls from './index.module.scss';

export const Login: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className={cls.container}>
      <div>
        <Link className={''} to="/">
          <AppstoreAddOutlined />
          <img src={Logo1} />
        </Link>
        <Card>
          <Form layout="vertical">
            <Form.Item label="Email">
              <Input type="email" placeholder="you@email.com" size="large" />
            </Form.Item>
            <Form.Item label="Password">
              <Input type="password" size="large" />
            </Form.Item>
            <Button type="primary" size="large" block>
              Sign in
            </Button>
          </Form>
        </Card>
      </div>
    </div>
  );
};
