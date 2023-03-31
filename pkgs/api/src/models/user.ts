import JWT from 'jsonwebtoken';
import type { CreationOptional } from 'sequelize';
import {
  Model,
  CreatedAt,
  UpdatedAt,
  Table,
  PrimaryKey,
  Default,
  Column,
  DataType,
} from 'sequelize-typescript';

import { JWT_SECRET } from '../common/auth';
import type { DBUser } from '../types/db';

type PropCreateUser = Partial<Pick<DBUser, 'id'>> &
  Pick<DBUser, 'email' | 'name'>;

@Table({ tableName: 'users', modelName: 'user' })
export class User extends Model<DBUser, PropCreateUser> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @Column
  declare name: string;

  @Column
  declare email: string;

  @Column({ field: 'email_verified_at', type: DataType.DATE })
  declare emailVerifiedAt: Date | null;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  getJwtToken(expiresAt?: Date): string {
    return JWT.sign(
      {
        id: this.id,
        expiresAt: expiresAt ? expiresAt.toISOString() : undefined,
        type: 'session',
      },
      JWT_SECRET
    );
  }
}
