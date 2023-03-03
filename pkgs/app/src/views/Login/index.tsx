import { IconApps } from '@tabler/icons-react';
import { Button, Form, Input } from 'antd';
import { Link } from 'react-router-dom';

import { Card } from '../../components/Card';
import Logo1 from '../../static/logo2.svg';

import cls from './index.module.scss';

export const Login: React.FC = () => {
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
