import type { Table } from 'dexie';
import Dexie from 'dexie';

import type { DBDocument } from '../types/db/documents';
import type { DBOrg } from '../types/db/orgs';
import type { DBProject } from '../types/db/projects';
import type { DBUser } from '../types/db/users';

export class MySubClassedDexie extends Dexie {
  users!: Table<DBUser>;
  orgs!: Table<DBOrg>;
  projects!: Table<DBProject>;
  documents!: Table<DBDocument>;

  constructor() {
    super('specfy');
    this.version(6).stores({
      users: 'id, name, email, createdAt, updatedAt',
      orgs: 'id, name, createdAt, updatedAt',
      projects:
        'id, [orgId+slug], name, description, author, createdAt, updatedAt',
      contents:
        '[orgId+id], projectId, type, typeId, name, slug, create, update, use, remove, tldr, blocks, authors, reviewers, approvedBy, status, locked, createdAt, updatedAt',
    });
  }
}

export const db = new MySubClassedDexie();
