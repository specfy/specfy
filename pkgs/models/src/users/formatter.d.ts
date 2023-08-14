import type { Perms, Users } from '@specfy/db';
import type { ApiUser, ApiUserPublic } from './types.api.js';
import type { ApiMe } from './types.api.me.js';
export declare function toApiUser(user: Users): ApiUser;
export declare function toApiUserPublic(user: Users): ApiUserPublic;
export declare function toApiMe(user: Users, perms: Perms[]): ApiMe;
