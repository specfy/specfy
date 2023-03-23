import type { CreationOptional, ForeignKey } from 'sequelize';
import {
  Model,
  CreatedAt,
  Table,
  PrimaryKey,
  Column,
  DataType,
  BeforeCreate,
} from 'sequelize-typescript';

import { nanoid } from '../common/id';
import type { DBActivity, DBOrg, DBProject, DBUser } from '../types/db';

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
      | 'targetProjectId'
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

  @Column({ field: 'target_project_id', type: DataType.STRING })
  declare targetProjectId: DBActivity['targetProjectId'];

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

  @BeforeCreate
  static async onBeforeCreate(model: Activity): Promise<void> {
    model.activityGroupId = model.activityGroupId || nanoid();
    model.id = model.id || nanoid();
  }
}
