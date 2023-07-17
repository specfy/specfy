import type { ApiMe } from '@specfy/api/src/types/api';
import { Button } from 'antd';
import { createContext, useEffect, useMemo } from 'react';

import { qcli, refreshProject } from '../common/query';
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
    socket.on('job.start', (data) => {
      const job = data.job;
      qcli.invalidateQueries(['listJobs', job.orgId, job.projectId]);
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
        qcli.invalidateQueries(['listJobs', job.orgId, job.projectId]);
        toast.update({
          id: job.id,
          status: job.status === 'failed' ? 'error' : 'success',
          loading: false,
        });
        toast.add({
          title: 'This project has been updated',
          closable: false,
          action: (
            <Button
              size="small"
              onClick={() => refreshProject(job.orgId, job.projectId!, true)}
            >
              Refresh
            </Button>
          ),
        });
      }, 1000);
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
