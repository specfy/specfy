import {
  Model,
  Table,
  PrimaryKey,
  Column,
  DataType,
} from 'sequelize-typescript';

import type { DBVerificationToken } from '../types/db';

type PropCreateVerificationToken = DBVerificationToken;

@Table({ tableName: 'verification_token', modelName: 'verificationToken' })
export class VerificationToken extends Model<
  DBVerificationToken,
  PropCreateVerificationToken
> {
  @PrimaryKey
  @Column(DataType.STRING)
  declare token: DBVerificationToken['token'];

  @Column(DataType.STRING)
  declare identifier: DBVerificationToken['identifier'];

  @Column({ field: 'expires_at', type: DataType.DATE })
  declare expiresAt: DBVerificationToken['expires'];
}
