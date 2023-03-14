import type { CreationOptional, ForeignKey } from 'sequelize';
import {
  Model,
  CreatedAt,
  Table,
  PrimaryKey,
  Column,
  DataType,
  Scopes,
  BelongsTo,
} from 'sequelize-typescript';

import type {
  DBComment,
  DBOrg,
  DBProject,
  DBReview,
  DBRevision,
  DBUser,
} from '../types/db';

import { User } from './user';

export type PropReviewCreate = Partial<Pick<DBReview, 'id'>> &
  Pick<DBReview, 'commentId' | 'orgId' | 'projectId' | 'revisionId' | 'userId'>;

@Scopes(() => ({
  // includes
  withUser: {
    include: [{ model: User, required: true }],
  },
}))
@Table({ tableName: 'reviews', modelName: 'review', updatedAt: false })
export class RevisionReview extends Model<DBReview, PropReviewCreate> {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, autoIncrement: true })
  declare id: CreationOptional<number>;

  @Column({ field: 'org_id', type: DataType.STRING })
  declare orgId: ForeignKey<DBOrg['id']>;

  @Column({ field: 'project_id', type: DataType.STRING })
  declare projectId: ForeignKey<DBProject['id']>;

  @Column({ field: 'revision_id', type: DataType.UUIDV4 })
  declare revisionId: ForeignKey<DBRevision['id']>;

  @Column({ field: 'user_id', type: DataType.UUIDV4 })
  declare userId: ForeignKey<DBUser['id']>;

  @Column({ field: 'comment_id', type: DataType.BIGINT })
  declare commentId: ForeignKey<DBComment['id']> | null;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @BelongsTo(() => User, 'user_id')
  declare user: User;
}
