import type { CreationOptional, ForeignKey } from 'sequelize';
import {
  Model,
  CreatedAt,
  UpdatedAt,
  Table,
  PrimaryKey,
  Column,
  DataType,
  Scopes,
} from 'sequelize-typescript';

import type {
  DBComment,
  DBOrg,
  DBProject,
  DBRevision,
  DBUser,
} from '../types/db';

import { User } from './user';

export type PropCommentCreate = Partial<Pick<DBComment, 'id'>> &
  Pick<DBComment, 'content' | 'orgId' | 'projectId' | 'revisionId' | 'userId'>;

@Scopes(() => ({
  // includes
  withUser: {
    include: [{ model: User }],
  },
}))
@Table({ tableName: 'comments', modelName: 'comment' })
export class RevisionComment extends Model<DBComment, PropCommentCreate> {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, autoIncrement: true })
  declare id: CreationOptional<number>;

  @Column({ field: 'org_id', type: DataType.STRING })
  declare orgId: ForeignKey<DBOrg['id']>;

  @Column({ field: 'project_id', type: DataType.UUIDV4 })
  declare projectId: ForeignKey<DBProject['id']>;

  @Column({ field: 'revision_id', type: DataType.UUIDV4 })
  declare revisionId: ForeignKey<DBRevision['id']>;

  @Column({ field: 'user_id', type: DataType.UUIDV4 })
  declare userId: ForeignKey<DBUser['id']>;

  @Column({ type: DataType.JSON })
  declare content: CreationOptional<DBComment['content']>;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;
}
