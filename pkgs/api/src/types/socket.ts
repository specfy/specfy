import type { Users } from '@prisma/client';
import type { Server } from 'socket.io';

import type { PermsWithOrg } from '../models/perms/types.js';

import type { ApiJob, ApiProject } from './api/index.js';

export interface PayloadAuth {
  userId: string;
  token: string;
}

export type EventJob = {
  job: ApiJob;
  project: ApiProject;
};

export interface ServerEvents {
  'job.start': (data: EventJob) => void;
  'job.finish': (data: EventJob) => void;
}

export type ListenEvents = Record<string, unknown>;
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
