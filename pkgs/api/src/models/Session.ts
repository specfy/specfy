import {
  Model,
  Table,
  PrimaryKey,
  Default,
  Column,
  DataType,
} from 'sequelize-typescript';

import type { DBSession } from '../types/db';

type PropCreateSession = DBSession;

@Table({ tableName: 'sessions', modelName: 'session' })
export class Session extends Model<DBSession, PropCreateSession> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: DBSession['id'];

  @Column({ field: 'user_id', type: DataType.UUID })
  declare userId: DBSession['userId'];

  @Column({ field: 'session_token', type: DataType.STRING })
  declare sessionToken: DBSession['sessionToken'];

  @Column({ field: 'expires_at', type: DataType.DATE })
  declare expiresAt: Date;
}
