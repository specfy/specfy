import type { ApiMe } from '@specfy/models';
import { createContext, useEffect, useMemo } from 'react';

import { socket } from '../common/socket';

import { publish } from './useEventBus';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SocketContextInterface {}

const SocketContext = createContext<SocketContextInterface>(
  {} as SocketContextInterface
);

export const SocketProvider: React.FC<{
  children: React.ReactNode;
  user: ApiMe;
}> = ({ children, user }) => {
  useEffect(() => {
    if (!user) {
      return;
    }

    if (!socket.connected) {
      socket.auth = { userId: user.id, token: user.token };
      socket.connect();
    }
  }, [user]);

  useEffect(() => {
    socket.onAny((event, args) => {
      publish(event, args);
    });

    return () => {
      socket.offAny();
    };
  }, []);

  const value = useMemo(() => {
    return {};
  }, []);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
