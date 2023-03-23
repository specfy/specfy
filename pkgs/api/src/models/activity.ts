import type { CreationOptional, ForeignKey } from 'sequelize';
import {
  Model,
  CreatedAt,
  Table,
  PrimaryKey,
  Column,
  DataType,
  BeforeCreate,
  Scopes,
  BelongsTo,
  HasOne,
} from 'sequelize-typescript';

import { nanoid } from '../common/id';
import type { DBActivity, DBOrg, DBProject, DBUser } from '../types/db';

import { Component } from './component';
import { Document } from './document';
import { Policy } from './policy';
import { Project } from './project';
import { Revision } from './revision';
import { User } from './user';

@Scopes(() => ({
  // includes
  withUser: {
    include: [{ model: User, attributes: ['id', 'name'], as: 'user' }],
  },
  withProject: {
    include: [{ model: Project, attributes: ['id', 'name', 'slug'] }],
  },
  withTargets: {
    include: [
      { model: User, attributes: ['id', 'name'], as: 'target_user' },
      { model: Document, attributes: ['id', 'name'] },
      { model: Component, attributes: ['id', 'name'] },
      { model: Revision, attributes: ['id', 'name'] },
      { model: Policy, attributes: ['id', 'name'] },
    ],
  },
}))
@Table({ tableName: 'activities', modelName: 'activity', timestamps: false })
export class Activity extends Model<
  DBActivity,
  Partial<
    Pick<
      DBActivity,
      | 'activityGroupId'
      | 'createdAt'
      | 'id'
      | 'targetComponentId'
      | 'targetDocumentId'
      | 'targetPolicyId'
      | 'targetRevisionId'
      | 'targetUserId'
    >
  > &
    Pick<DBActivity, 'action' | 'orgId' | 'projectId' | 'userId'>
> {
  @PrimaryKey
  @Column(DataType.STRING)
  declare id: CreationOptional<string>;

  @Column({ field: 'org_id', type: DataType.STRING })
  declare orgId: ForeignKey<DBOrg['id']>;

  @Column({ field: 'project_id', type: DataType.STRING })
  declare projectId: ForeignKey<DBProject['id']>;

  @Column({ field: 'user_id', type: DataType.STRING })
  declare userId: ForeignKey<DBUser['id']>;

  @Column({ field: 'activity_group_id', type: DataType.STRING })
  declare activityGroupId: DBActivity['activityGroupId'];

  @Column({ field: 'action', type: DataType.STRING })
  declare action: DBActivity['action'];

  @Column({ field: 'target_user_id', type: DataType.STRING })
  declare targetUserId: DBActivity['targetUserId'];

  @Column({ field: 'target_component_id', type: DataType.STRING })
  declare targetComponentId: DBActivity['targetComponentId'];

  @Column({ field: 'target_document_id', type: DataType.STRING })
  declare targetDocumentId: DBActivity['targetDocumentId'];

  @Column({ field: 'target_revision_id', type: DataType.STRING })
  declare targetRevisionId: DBActivity['targetRevisionId'];

  @Column({ field: 'target_policy_id', type: DataType.STRING })
  declare targetPolicyId: DBActivity['targetPolicyId'];

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  // --- Rel
  @BelongsTo(() => Project, { foreignKey: 'project_id' })
  declare project: Project;

  @BelongsTo(() => User, { foreignKey: 'user_id', as: 'user' })
  declare user: User;

  @HasOne(() => User, {
    sourceKey: 'targetUserId',
    foreignKey: 'id',
    as: 'target_user',
  })
  declare targetUser: User;

  @HasOne(() => Component, { sourceKey: 'targetComponentId', foreignKey: 'id' })
  declare targetComponent: Component;

  @HasOne(() => Document, { sourceKey: 'targetDocumentId', foreignKey: 'id' })
  declare targetDocument: Document;

  @HasOne(() => Revision, { sourceKey: 'targetRevisionId', foreignKey: 'id' })
  declare targetRevision: Revision;

  @HasOne(() => Policy, { sourceKey: 'targetPolicyId', foreignKey: 'id' })
  declare targetPolicy: Policy;

  // --- Hooks
  @BeforeCreate
  static async onBeforeCreate(model: Activity): Promise<void> {
    model.activityGroupId = model.activityGroupId || nanoid();
    model.id = model.id || nanoid();
  }
}
