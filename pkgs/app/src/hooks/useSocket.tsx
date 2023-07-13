import type { ApiMe } from '@specfy/api/src/types/api';
import { createContext, useEffect, useMemo } from 'react';
import { useMount, useUnmount } from 'react-use';

import { queryClient } from '../common/query';
import { socket } from '../common/socket';

import { useToast } from './useToast';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SocketContextInterface {}

const SocketContext = createContext<SocketContextInterface>(
  {} as SocketContextInterface
);

export const SocketProvider: React.FC<{
  children: React.ReactNode;
  user: ApiMe;
}> = ({ children, user }) => {
  const toast = useToast();

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!socket.connected) {
      socket.auth = { userId: user.id, token: user.token };
      socket.connect();
    }
  }, [user]);

  useMount(() => {
    socket.on('job.start', (data) => {
      queryClient.invalidateQueries(['listJobs', data.orgId, data.projectId]);
      toast.add({
        id: data.id,
        title: `Deploy #${data.typeId}`,
        loading: true,
      });
    });

    socket.on('job.finish', (data) => {
      setTimeout(() => {
        queryClient.invalidateQueries(['listJobs', data.orgId, data.projectId]);
        toast.update({
          id: data.id,
          status: data.status === 'failed' ? 'error' : 'success',
          loading: false,
        });
      }, 1000);
    });
  });

  useUnmount(() => {
    socket.offAny();
  });

  const value = useMemo(() => {
    return {};
  }, []);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
