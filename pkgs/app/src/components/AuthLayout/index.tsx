import classNames from 'classnames';
import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useMount } from 'react-use';

import { useAuth } from '../../hooks/useAuth';
import { SocketProvider } from '../../hooks/useSocket';
import { Loading } from '../Loading';

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
        <Loading />
      </div>
    );
  }

  if (!auth.user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className={cls.app}>
      <SocketProvider user={auth.user}>
        <div>{children ? children : <Outlet />}</div>
      </SocketProvider>
    </div>
  );
};
