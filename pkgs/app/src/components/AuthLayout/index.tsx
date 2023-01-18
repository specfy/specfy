import { Layout } from 'antd';
import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { LayoutHeader } from '../LayoutHeader';

import cls from './index.module.scss';

export const AuthLayout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
    // return <div>hello</div>;
  }

  return (
    <Layout className={cls.app}>
      <LayoutHeader></LayoutHeader>
      <Layout.Content>{children ? children : <Outlet />}</Layout.Content>
    </Layout>
  );
};
