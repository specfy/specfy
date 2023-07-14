import type { ApiMe } from '@specfy/api/src/types/api';
import { createContext, useEffect, useMemo } from 'react';

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

  useEffect(() => {
    console.log('on sub');
    socket.on('job.start', (data) => {
      const job = data.job;
      queryClient.invalidateQueries(['listJobs', job.orgId, job.projectId]);
      toast.add({
        id: job.id,
        title: `Deploy #${job.typeId}`,
        loading: true,
        link: `/${job.orgId}/${data.project.slug}/deploys/${job.id}`,
      });
    });

    socket.on('job.finish', (data) => {
      setTimeout(() => {
        const job = data.job;
        queryClient.invalidateQueries(['listJobs', job.orgId, job.projectId]);
        toast.update({
          id: job.id,
          status: job.status === 'failed' ? 'error' : 'success',
          loading: false,
        });
      }, 1000);
    });

    return () => {
      console.log('on unsub');

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
