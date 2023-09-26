import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useMount } from 'react-use';

import { Flex } from '@/components/Flex';
import { Loading } from '@/components/Loading';
import { Subdued } from '@/components/Text';
import { useAuth } from '@/hooks/useAuth';
import { SocketProvider } from '@/hooks/useSocket';

import cls from './index.module.scss';

export const AuthLayout: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const [wait, setWait] = useState(true);
  const auth = useAuth();
  const [showHint, setShowHint] = useState(false);

  useMount(async () => {
    // TODO: make sure this is correct
    await auth.tryLogin();
    setWait(false);
  });
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowHint(true);
    }, 5000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  if (wait) {
    return (
      <div className={classNames(cls.app, cls.loading)}>
        <Flex column>
          <Loading />
          <Subdued className={classNames(cls.hint, showHint && cls.show)}>
            This is taking longer than expected.
            <br /> Please refresh this page or contact us, support@specfy.io
          </Subdued>
        </Flex>
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
