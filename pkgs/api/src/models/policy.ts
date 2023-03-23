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
import type { DBActivityType, DBPolicy } from '../types/db';

import ActivitableModel from './base/activitable';
import type { Org } from './org';

@Table({ tableName: 'policies', modelName: 'policy' })
export class Policy extends ActivitableModel<
  DBPolicy,
  Partial<Pick<DBPolicy, 'id'>> &
    Pick<DBPolicy, 'content' | 'name' | 'orgId' | 'tech' | 'type'>
> {
  activityType: DBActivityType = 'Policy';

  @PrimaryKey
  @Column({ type: DataType.STRING })
  declare id: CreationOptional<DBPolicy['id']>;

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

  @BeforeCreate
  static async onBeforeCreate(model: Policy): Promise<void> {
    model.id = model.id || nanoid();
  }
}
