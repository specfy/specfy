import { LoadingOutlined } from '@ant-design/icons';
import { Layout } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useMount } from 'react-use';

import { useAuth } from '../../hooks/useAuth';
import { LayoutHeader } from '../LayoutHeader';

import cls from './index.module.scss';

export const AuthLayout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [wait, setWait] = useState(true);
  const auth = useAuth();

  useMount(async () => {
    // TODO: make sure this is correct
    await auth.tryLogin();
    setWait(false);
  });

  if (wait) {
    return (
      <div className={classNames(cls.app, cls.loading)}>
        <LoadingOutlined />
      </div>
    );
  }

  if (!auth.user) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout className={cls.app}>
      <LayoutHeader></LayoutHeader>
      <Layout.Content>{children ? children : <Outlet />}</Layout.Content>
    </Layout>
  );
};
