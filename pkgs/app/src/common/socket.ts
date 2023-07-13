import type { ListenEvents, ServerEvents } from '@specfy/api/src/types/socket';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

const URL = 'http://localhost:3000';

export const socket: Socket<ServerEvents, ListenEvents> = io(URL, {
  path: '/ws',
  transports: ['websocket'],
  reconnectionDelay: 1000,
  reconnectionDelayMax: 30000,
  autoConnect: false,
});
