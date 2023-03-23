import type { CreationOptional, ForeignKey } from 'sequelize';
import {
  CreatedAt,
  UpdatedAt,
  Table,
  PrimaryKey,
  Column,
  DataType,
  BeforeCreate,
} from 'sequelize-typescript';

import { nanoid } from '../common/id';
import type { DBActivityType, DBRevision } from '../types/db';

import ActivitableModel from './base/activitable';
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
export class Revision extends ActivitableModel<DBRevision, PropCreate> {
  activityType: DBActivityType = 'Revision';

  @PrimaryKey
  @Column(DataType.STRING)
  declare id: CreationOptional<string>;

  @Column({ field: 'org_id', type: DataType.STRING })
  declare orgId: ForeignKey<Org['id']>;

  @Column({ field: 'project_id', type: DataType.STRING })
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

  @Column({ field: 'merged_at', type: DataType.DATE })
  declare mergedAt: Date | null;

  @Column({ field: 'closed_at', type: DataType.DATE })
  declare closedAt: Date | null;

  @BeforeCreate
  static async onBeforeCreate(model: Revision): Promise<void> {
    model.id = model.id || nanoid();
  }
}
