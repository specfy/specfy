import {
  CreatedAt,
  UpdatedAt,
  Table,
  PrimaryKey,
  Column,
  HasMany,
  Scopes,
} from 'sequelize-typescript';

import type { DBActivityType, DBOrg } from '../types/db';

import ActivitableModel from './base/activitable';
import { Perm } from './perm';

@Scopes(() => ({
  // includes
  forUser: (userId: string) => {
    return {
      include: [
        {
          model: Perm,
          required: true,
          where: {
            userId,
            projectId: null,
          },
        },
      ],
    };
  },
}))
@Table({ tableName: 'orgs', modelName: 'org' })
export class Org extends ActivitableModel<DBOrg, Pick<DBOrg, 'id' | 'name'>> {
  activityType: DBActivityType = 'Org';

  @PrimaryKey
  @Column
  declare id: string;

  @Column
  declare name: string;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @HasMany(() => Perm, 'org_id')
  declare perm;
}
