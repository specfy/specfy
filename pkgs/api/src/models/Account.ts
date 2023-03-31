import {
  Model,
  Table,
  PrimaryKey,
  Default,
  Column,
  DataType,
} from 'sequelize-typescript';

import type { DBAccount } from '../types/db';

type PropCreateAccount = DBAccount;

@Table({ tableName: 'accounts', modelName: 'account' })
export class Account extends Model<DBAccount, PropCreateAccount> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: DBAccount['id'];

  @Column({ field: 'user_id', type: DataType.UUID })
  declare userId: DBAccount['userId'];

  @Column({ field: 'type', type: DataType.STRING })
  declare type: DBAccount['type'];

  @Column(DataType.STRING)
  declare provider: DBAccount['provider'];

  @Column({ field: 'provider_account_id', type: DataType.STRING })
  declare providerAccountId: DBAccount['providerAccountId'];

  @Column({ field: 'refresh_token', type: DataType.STRING })
  declare refreshToken: DBAccount['refreshToken'];

  @Column({ field: 'access_token', type: DataType.STRING })
  declare accessToken: DBAccount['accessToken'];

  @Column({ field: 'token_type', type: DataType.STRING })
  declare tokenType: DBAccount['tokenType'];

  @Column(DataType.STRING)
  declare scope: DBAccount['scope'];

  @Column({ field: 'id_token', type: DataType.STRING })
  declare idToken: DBAccount['idToken'];

  @Column({ field: 'session_state', type: DataType.STRING })
  declare sessionState: DBAccount['sessionState'];

  @Column({ field: 'expires_at', type: DataType.INTEGER })
  declare expiresAt: DBAccount['expiresAt'];
}
