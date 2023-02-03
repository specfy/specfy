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
    | 'edges'
    | 'inComponent'
    | 'name'
    | 'orgId'
    | 'projectId'
    | 'tech'
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

  @Column({ type: DataType.JSON })
  declare edges: DBComponent['edges'];

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
