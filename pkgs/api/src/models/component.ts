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
  BeforeUpdate,
} from 'sequelize-typescript';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

import type { DBBlobComponent, DBComponent } from '../types/db';

import type { PropBlobCreate } from './blob';
import { RevisionBlob } from './blob';
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

  @Column({ field: 'blob_id', type: DataType.UUIDV4 })
  declare blobId: ForeignKey<RevisionBlob['id']>;

  @Column({ type: DataType.STRING })
  declare type: DBComponent['type'];

  @Column({ field: 'type_id', type: DataType.STRING })
  declare typeId: DBComponent['typeId'];

  @Column
  declare name: string;

  @Column({ type: DataType.JSON })
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
  static async onBeforeCreate(
    model: Component,
    { transaction }
  ): Promise<void> {
    model.slug = slugify(model.name, { lower: true, trim: true });
    model.type = model.type || 'component';
    model.id = model.id || uuidv4();

    const body: PropBlobCreate = {
      orgId: model.orgId,
      projectId: model.id,
      parentId: null,
      type: 'component',
      typeId: model.id,
      blob: model.getJsonForBlob(),
      deleted: false,
    };
    const blob = await RevisionBlob.create(body, { transaction });
    model.blobId = blob.id;
  }

  @BeforeUpdate
  static async onBeforeUpdate(model: Component) {
    if (model.name !== model.previous.name) {
      model.slug = slugify(model.name, { lower: true, trim: true });
    }
  }

  getJsonForBlob(): DBBlobComponent['blob'] {
    const { id, orgId, createdAt, updatedAt, blobId, ...simplified } =
      this.toJSON();
    return simplified;
  }
}
