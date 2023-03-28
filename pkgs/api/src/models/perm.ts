import type { CreationOptional, ForeignKey } from 'sequelize';
import {
  Model,
  CreatedAt,
  UpdatedAt,
  Table,
  PrimaryKey,
  Default,
  Column,
  DataType,
  BelongsTo,
  Scopes,
} from 'sequelize-typescript';

import type { DBPerm } from '../types/db';

import { Org } from './org';
import type { Project } from './project';
import { User } from './user';

type PropCreatePerm = Pick<DBPerm, 'orgId' | 'projectId' | 'role' | 'userId'>;

@Scopes(() => ({
  // includes
  withUser: {
    include: [User],
  },
  withOrg: {
    include: [
      {
        model: Org,
        required: true,
      },
    ],
  },
}))
@Table({ tableName: 'perms', modelName: 'perm' })
export class Perm extends Model<DBPerm, PropCreatePerm> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @Column({ field: 'org_id', type: DataType.STRING })
  declare orgId: ForeignKey<Org['id']>;

  @Column({ field: 'project_id', type: DataType.STRING })
  declare projectId: ForeignKey<Project['id']>;

  @Column({ field: 'user_id', type: DataType.UUIDV4 })
  declare userId: string;

  @BelongsTo(() => User, 'user_id')
  declare user: User;

  @BelongsTo(() => Org, 'org_id')
  declare org: Org;

  @Column({ type: DataType.STRING })
  declare role: DBPerm['role'];

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;
}
