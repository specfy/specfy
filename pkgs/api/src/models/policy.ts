import type { CreationOptional, ForeignKey } from 'sequelize';
import {
  Model,
  CreatedAt,
  UpdatedAt,
  Table,
  PrimaryKey,
  Column,
  DataType,
} from 'sequelize-typescript';

import type { DBPolicy } from '../types/db';

import type { Org } from './org';

@Table({ tableName: 'policies', modelName: 'policy' })
export class Policy extends Model<
  DBPolicy,
  Partial<Pick<DBPolicy, 'id'>> &
    Pick<DBPolicy, 'content' | 'name' | 'orgId' | 'tech' | 'type'>
> {
  @PrimaryKey
  @Column({ type: DataType.BIGINT, autoIncrement: true })
  declare id: CreationOptional<number>;

  @Column({ field: 'org_id', type: DataType.STRING })
  declare orgId: ForeignKey<Org['id']>;

  @Column({ type: DataType.STRING })
  declare type: DBPolicy['type'];

  @Column({ type: DataType.STRING })
  declare name: DBPolicy['name'];

  @Column({ type: DataType.STRING })
  declare tech: DBPolicy['tech'];

  @Column({ type: DataType.JSON })
  declare content: DBPolicy['content'];

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  // getJsonForBlob(): DBBlobPolicy['blob'] {
  //   const { id, orgId, createdAt, updatedAt, ...simplified } = this.toJSON();
  //   return simplified;
  // }
}
