import type { Users } from '@specfy/db';
import type { PermsWithOrg, ApiProject, ApiJobList } from '@specfy/models';
import type { Server } from 'socket.io';

export interface PayloadAuth {
  userId: string;
  token: string;
}

export type EventJob = {
  job: ApiJobList;
  project: ApiProject;
};

export interface ServerEvents {
  'job.start': (data: EventJob) => void;
  'job.finish': (data: EventJob) => void;
}

export interface ListenEvents {
  join: (data: { orgId: string; projectId: string }) => void;
}
type InterEvents = Record<string, unknown>;

export type SocketServer = Server<
  ListenEvents,
  ServerEvents,
  InterEvents,
  {
    sessionID?: string;
    user?: Users;
    perms?: PermsWithOrg[];
  }
>;
