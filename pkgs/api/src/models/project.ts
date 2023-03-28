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
import type {
  DBActivityType,
  DBBlobProject,
  DBProject,
  DBProjectLink,
} from '../types/db';

import ActivitableModel from './base/activitable';
import type { PropBlobCreate } from './blob';
import { RevisionBlob } from './blob';
import type { Org } from './org';

@Table({
  tableName: 'projects',
  modelName: 'project',
  paranoid: false,
})
export class Project extends ActivitableModel<
  DBProject,
  Partial<Pick<DBProject, 'blobId' | 'id' | 'slug'>> &
    Pick<
      DBProject,
      'description' | 'display' | 'edges' | 'links' | 'name' | 'orgId'
    >
> {
  activityType: DBActivityType = 'Project';

  @PrimaryKey
  @Column(DataType.STRING)
  declare id: CreationOptional<string>;

  @Column({ field: 'org_id', type: DataType.STRING })
  declare orgId: ForeignKey<Org['id']>;

  @Column({ field: 'blob_id', type: DataType.UUIDV4 })
  declare blobId: ForeignKey<RevisionBlob['id']>;

  @Column
  declare name: string;

  @Column({ type: DataType.JSON })
  declare description: CreationOptional<DBProject['description']>;

  @Column
  declare slug: string;

  @Column({ type: DataType.JSON })
  declare links: CreationOptional<DBProjectLink[]>;

  @Column({ type: DataType.JSON })
  declare display: DBProject['display'];

  @Column({ type: DataType.JSON })
  declare edges: DBProject['edges'];

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BeforeCreate
  static async onBeforeCreate(model: Project, { transaction }): Promise<void> {
    model.slug = model.slug || slugify(model.name, { lower: true, trim: true });
    model.id = model.id || nanoid();

    await model.createBlob(transaction);
  }

  @BeforeUpdate
  static async onBeforeUpdate(model: Project) {
    if (model.name !== model.previous.name) {
      model.slug = slugify(model.name, { lower: true, trim: true });
    }
  }

  getJsonForBlob(): DBBlobProject['blob'] {
    return this.toJSON();
  }

  async createBlob(transaction?: any) {
    const body: PropBlobCreate = {
      orgId: this.orgId,
      projectId: this.id,
      parentId: null,
      type: 'project',
      typeId: this.id,
      blob: this.getJsonForBlob(),
      created: true,
      deleted: false,
    };

    const blob = await RevisionBlob.create(body, { transaction });
    this.blobId = blob.id;
  }
}
