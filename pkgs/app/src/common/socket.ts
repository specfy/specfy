import { io } from 'socket.io-client';

import type { ListenEvents, ServerEvents } from '@specfy/socket';

import { API_HOSTNAME } from './envs';

import type { Socket } from 'socket.io-client';

export const socket: Socket<ServerEvents, ListenEvents> = io(API_HOSTNAME, {
  path: '/ws',
  transports: ['websocket'],
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  autoConnect: false,
});
