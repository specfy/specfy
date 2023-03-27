import type { CreationOptional, ForeignKey } from 'sequelize';
import {
  CreatedAt,
  UpdatedAt,
  Table,
  PrimaryKey,
  Column,
  DataType,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import slugify from 'slugify';

import { nanoid } from '../common/id';
import type { DBActivityType, DBBlobComponent, DBComponent } from '../types/db';

import ActivitableModel from './base/activitable';
import type { PropBlobCreate } from './blob';
import { RevisionBlob } from './blob';
import type { Org } from './org';
import type { Project } from './project';

@Table({
  tableName: 'components',
  modelName: 'component',
  paranoid: false,
})
export class Component extends ActivitableModel<
  DBComponent,
  Partial<Pick<DBComponent, 'blobId' | 'id'>> &
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
      | 'techId'
      | 'type'
      | 'typeId'
    >
> {
  activityType: DBActivityType = 'Component';

  @PrimaryKey
  @Column(DataType.STRING)
  declare id: CreationOptional<string>;

  @Column({ field: 'org_id', type: DataType.STRING })
  declare orgId: ForeignKey<Org['id']>;

  @Column({ field: 'project_id', type: DataType.STRING })
  declare projectId: ForeignKey<Project['id']>;

  @Column({ field: 'blob_id', type: DataType.UUIDV4 })
  declare blobId: ForeignKey<RevisionBlob['id']>;

  @Column({ field: 'tech_id', type: DataType.STRING })
  declare techId: DBComponent['techId'];

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
    model.id = model.id || nanoid();

    if (!model.blobId) {
      const body: PropBlobCreate = {
        orgId: model.orgId,
        projectId: model.id,
        parentId: null,
        type: 'component',
        typeId: model.id,
        blob: model.getJsonForBlob(),
        created: true,
        deleted: false,
      };
      const blob = await RevisionBlob.create(body, { transaction });
      model.blobId = blob.id;
    }
  }

  @BeforeUpdate
  static async onBeforeUpdate(model: Component) {
    if (model.name !== model.previous.name) {
      model.slug = slugify(model.name, { lower: true, trim: true });
    }
  }

  getJsonForBlob(): DBBlobComponent['blob'] {
    return this.toJSON();
  }
}
