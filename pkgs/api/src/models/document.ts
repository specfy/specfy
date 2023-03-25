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
import type { DBActivityType, DBBlobDocument, DBDocument } from '../types/db';

import ActivitableModel from './base/activitable';
import type { PropBlobCreate } from './blob';
import { RevisionBlob } from './blob';
import type { Org } from './org';
import type { Project } from './project';

type CreateProp = Partial<Pick<DBDocument, 'blobId' | 'id'>> &
  Pick<
    DBDocument,
    'content' | 'locked' | 'name' | 'orgId' | 'projectId' | 'tldr' | 'type'
  >;
@Table({
  tableName: 'documents',
  modelName: 'document',
  timestamps: false,
  paranoid: false,
})
export class Document extends ActivitableModel<DBDocument, CreateProp> {
  activityType: DBActivityType = 'Document';

  @PrimaryKey
  @Column(DataType.STRING)
  declare id: CreationOptional<string>;

  @Column({ field: 'org_id', type: DataType.STRING })
  declare orgId: ForeignKey<Org['id']>;

  @Column({ field: 'project_id', type: DataType.STRING })
  declare projectId: ForeignKey<Project['id']>;

  @Column({ field: 'blob_id', type: DataType.UUIDV4 })
  declare blobId: ForeignKey<RevisionBlob['id']>;

  @Column({ type: DataType.STRING })
  declare type: DBDocument['type'];

  @Column({ field: 'type_id', type: DataType.INTEGER })
  declare typeId: DBDocument['typeId'];

  @Column
  declare name: string;

  @Column
  declare slug: string;

  @Column
  declare tldr: string;

  @Column({ type: DataType.JSON })
  declare content: CreationOptional<DBDocument['content']>;

  @Column
  declare locked: boolean;

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date;

  @BeforeCreate
  static async onBeforeCreate(model: Document, { transaction }): Promise<void> {
    model.typeId =
      (await this.count({
        where: {
          orgId: model.orgId,
          type: model.type,
        },
      })) + 1;
    model.slug = slugify(model.name, {
      lower: true,
      trim: true,
    });
    model.id = model.id || nanoid();

    const body: PropBlobCreate = {
      orgId: model.orgId,
      projectId: model.id,
      parentId: null,
      type: 'document',
      typeId: model.id,
      blob: model.getJsonForBlob(),
      created: true,
      deleted: false,
    };
    const blob = await RevisionBlob.create(body, { transaction });
    model.blobId = blob.id;
  }

  @BeforeUpdate
  static async onBeforeUpdate(model: Document) {
    if (model.name !== model.previous.name) {
      model.slug = slugify(model.name, { lower: true, trim: true });
    }
  }

  getJsonForBlob(): DBBlobDocument['blob'] {
    return this.toJSON();
  }
}
