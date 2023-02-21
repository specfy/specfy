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
} from 'sequelize-typescript';

import type { DBRevision } from '../types/db/revisions';

import type { Org } from './org';
import type { Project } from './project';

type PropCreate = Partial<Pick<DBRevision, 'id'>> &
  Pick<
    DBRevision,
    | 'blobs'
    | 'description'
    | 'merged'
    | 'orgId'
    | 'projectId'
    | 'status'
    | 'title'
  >;

@Table({ tableName: 'revisions', modelName: 'revision' })
export class Revision extends Model<DBRevision, PropCreate> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @Column({ field: 'org_id', type: DataType.STRING })
  declare orgId: ForeignKey<Org['id']>;

  @Column({ field: 'project_id', type: DataType.UUIDV4 })
  declare projectId: ForeignKey<Project['id']>;

  @Column
  declare title: string;

  @Column({ type: DataType.JSON })
  declare description: CreationOptional<DBRevision['description']>;

  @Column({ type: DataType.JSON })
  declare blobs: CreationOptional<DBRevision['blobs']>;

  @Column({ type: DataType.BOOLEAN })
  declare locked: CreationOptional<DBRevision['locked']>;

  @Column({ type: DataType.STRING })
  declare status: CreationOptional<DBRevision['status']>;

  @Column({ type: DataType.BOOLEAN })
  declare merged: CreationOptional<DBRevision['merged']>;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @Column({ field: 'merged_at' })
  declare mergedAt: Date;

  @Column({ field: 'closed_at' })
  declare closedAt: Date;
}
