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
  Scopes,
  BelongsTo,
} from 'sequelize-typescript';

import type { DBBlob } from '../types/db/blobs';

import type { Org } from './org';
import type { Project } from './project';

export type PropBlobCreate = Partial<Pick<DBBlob, 'id'>> &
  Pick<
    DBBlob,
    'blob' | 'deleted' | 'orgId' | 'parentId' | 'projectId' | 'type' | 'typeId'
  >;

@Scopes(() => ({
  // includes
  withPrevious: {
    include: [{ model: RevisionBlob, attributes: ['blob'] }],
  },
}))
@Table({ tableName: 'blobs', modelName: 'blob' })
export class RevisionBlob extends Model<DBBlob, PropBlobCreate> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @Column({ field: 'org_id', type: DataType.STRING })
  declare orgId: ForeignKey<Org['id']>;

  @Column({ field: 'project_id', type: DataType.UUIDV4 })
  declare projectId: ForeignKey<Project['id']>;

  @Column({ field: 'type', type: DataType.STRING })
  declare type: DBBlob['type'];

  @Column({ field: 'type_id' })
  declare typeId: string;

  @Column({ field: 'parent_id' })
  declare parentId: string;

  @Column({ type: DataType.JSON })
  declare blob: CreationOptional<DBBlob['blob']>;

  @BelongsTo(() => RevisionBlob, 'parent_id')
  declare previousBlob: RevisionBlob | undefined;

  @Column({ type: DataType.BOOLEAN })
  declare deleted: CreationOptional<DBBlob['deleted']>;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;
}
