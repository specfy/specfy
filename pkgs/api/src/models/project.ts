import type { CreationOptional, ForeignKey } from 'sequelize';
import {
  Model,
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
import type { DBBlobProject, DBProject, DBProjectLink } from '../types/db';

import type { PropBlobCreate } from './blob';
import { RevisionBlob } from './blob';
import type { Org } from './org';

@Table({ tableName: 'projects', modelName: 'project' })
export class Project extends Model<
  DBProject,
  Partial<Pick<DBProject, 'id'>> &
    Pick<
      DBProject,
      'description' | 'display' | 'edges' | 'links' | 'name' | 'orgId'
    >
> {
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
    model.slug = slugify(model.name, { lower: true, trim: true });
    model.id = model.id || nanoid();

    const body: PropBlobCreate = {
      orgId: model.orgId,
      projectId: model.id,
      parentId: null,
      type: 'project',
      typeId: model.id,
      blob: model.getJsonForBlob(),
      deleted: false,
    };
    const blob = await RevisionBlob.create(body, { transaction });
    model.blobId = blob.id;
  }

  @BeforeUpdate
  static async onBeforeUpdate(model: Project) {
    if (model.name !== model.previous.name) {
      model.slug = slugify(model.name, { lower: true, trim: true });
    }
  }

  getJsonForBlob(): DBBlobProject['blob'] {
    const { id, orgId, createdAt, updatedAt, blobId, ...simplified } =
      this.toJSON();
    return simplified;
  }
}
