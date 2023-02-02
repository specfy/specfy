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

import type { DBComponent } from '../types/db/components';

import type { Org } from './org';
import type { Project } from './project';

@Table({ tableName: 'components', modelName: 'project' })
export class Component extends Model<
  DBComponent,
  Pick<
    DBComponent,
    | 'description'
    | 'display'
    | 'fromComponents'
    | 'inComponent'
    | 'name'
    | 'orgId'
    | 'projectId'
    | 'tech'
    | 'toComponents'
    | 'type'
    | 'typeId'
  >
> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: CreationOptional<string>;

  @Column({ field: 'org_id', type: DataType.STRING })
  declare orgId: ForeignKey<Org['id']>;

  @Column({ field: 'project_id', type: DataType.UUIDV4 })
  declare projectId: ForeignKey<Project['id']>;

  @Column({ type: DataType.STRING })
  declare type: DBComponent['type'];
  @Column({ field: 'type_id', type: DataType.STRING })
  declare typeId: DBComponent['typeId'];

  @Column
  declare name: string;

  @Column({ type: DataType.STRING })
  declare description: DBComponent['description'];

  @Column
  declare slug: string;

  @Column({ type: DataType.JSON })
  declare tech: string[];

  @Column({ type: DataType.JSON })
  declare display: DBComponent['display'];

  @Column({ field: 'in_component' })
  declare inComponent: string;

  @Column({ field: 'to_components', type: DataType.JSON })
  declare toComponents: string[];

  @Column({ field: 'from_components', type: DataType.JSON })
  declare fromComponents: string[];

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BeforeCreate
  static createSlug(model: Component): void {
    model.slug = slugify(model.name, { lower: true, trim: true });

    model.type = model.type || 'component';
  }
}
