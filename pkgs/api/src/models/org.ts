import {
  Model,
  CreatedAt,
  UpdatedAt,
  Table,
  PrimaryKey,
  Column,
  HasMany,
  Scopes,
} from 'sequelize-typescript';

import type { DBOrg } from '../types/db/orgs';

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
export class Org extends Model<DBOrg, Pick<DBOrg, 'id' | 'name'>> {
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
