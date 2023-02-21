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
import { v4 as uuidv4 } from 'uuid';

import type { DBBlobDocument } from '../types/db/blobs';
import type { DBDocument } from '../types/db/documents';

import type { PropBlobCreate } from './blob';
import { RevisionBlob } from './blob';
import type { Org } from './org';
import type { Project } from './project';

type CreateProp = Partial<Pick<DBDocument, 'id'>> &
  Pick<
    DBDocument,
    | 'content'
    | 'locked'
    | 'name'
    | 'orgId'
    | 'projectId'
    | 'status'
    | 'tldr'
    | 'type'
  >;
@Table({ tableName: 'documents', modelName: 'document' })
export class Document extends Model<DBDocument, CreateProp> {
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

  @Column
  declare type: 'rfc';

  @Column({ field: 'type_id', type: DataType.INTEGER })
  declare typeId: DBDocument['typeId'];

  @Column
  declare name: string;

  @Column
  declare slug: string;

  // create: string;
  // update: string[];
  // use: string[];
  // remove: string[];
  @Column
  declare tldr: string;

  @Column({ type: DataType.JSON })
  declare content: CreationOptional<DBDocument['content']>;
  // authors: string[];
  // reviewers: string[];
  // approvedBy: string[];

  @Column
  declare status: 'approved' | 'draft' | 'rejected';

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
    model.slug = slugify(model.name, { lower: true, trim: true });
    model.typeId =
      (await this.count({
        where: {
          orgId: model.orgId,
        },
      })) + 1;
    model.id = model.id || uuidv4();

    const body: PropBlobCreate = {
      orgId: model.orgId,
      projectId: model.id,
      parentId: null,
      type: 'document',
      typeId: model.id,
      blob: model.getJsonForBlob(),
      deleted: false,
    };
    const blob = await RevisionBlob.create(body, { transaction });
    model.blobId = blob.id;
  }

  getJsonForBlob(): DBBlobDocument['blob'] {
    const { id, orgId, projectId, createdAt, updatedAt, ...simplified } =
      this.toJSON();
    return simplified;
  }
}
