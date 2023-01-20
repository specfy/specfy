import type { Table } from 'dexie';
import Dexie from 'dexie';

import type { DBUser } from '../types/db/users';
import type { DBOrg } from '../types/db/orgs';
import type { DBProject } from '../types/db/projects';

export class MySubClassedDexie extends Dexie {
  users!: Table<DBUser>;
  orgs!: Table<DBOrg>;
  projects!: Table<DBProject>;

  constructor() {
    super('specfy');
    this.version(1).stores({
      users: 'id, name, email, createdAt, updatedAt',
      orgs: 'id, name, createdAt, updatedAt',
      projects: 'id, slug, name, description, author, createdAt, updatedAt',
    });
  }
}

export const db = new MySubClassedDexie();
