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
  BeforeCreate,
} from 'sequelize-typescript';
import slugify from 'slugify';

import type { DBProject, DBProjectLink } from '../types/db/projects';

import type { Org } from './org';

@Table({ tableName: 'projects', modelName: 'project' })
export class Project extends Model<
  DBProject,
  Pick<DBProject, 'description' | 'name' | 'orgId'>
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @Column({ field: 'org_id', type: DataType.STRING })
  declare orgId: ForeignKey<Org['id']>;

  @Column
  declare name: string;

  @Column({ type: DataType.STRING })
  declare description: CreationOptional<string>;

  @Column
  declare slug: string;

  @Column({ type: DataType.JSON })
  declare links: CreationOptional<DBProjectLink[]>;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BeforeCreate
  static createSlug(model: Project): void {
    model.slug = slugify(model.name, { lower: true, trim: true });
  }
}
