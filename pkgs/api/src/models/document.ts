import type { CreationOptional, ForeignKey } from 'sequelize';
import type { HookOptions } from 'sequelize-typescript';
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

import type { DBDocument } from '../types/db/documents';

import { Blob } from './blob';
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
  declare blobId: ForeignKey<Blob['id']>;

  @Column
  declare type: 'rfc';

  @Column({ field: 'type_id' })
  declare typeId: number;

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
  static async onBeforeCreate(
    model: Document,
    { transaction }: HookOptions
  ): Promise<void> {
    model.slug = slugify(model.name, { lower: true, trim: true });
    model.typeId =
      (await this.count({
        where: {
          orgId: model.orgId,
        },
      })) + 1;
    model.id = model.id || uuidv4();

    const { id, orgId, projectId, createdAt, updatedAt, ...simplified } =
      model.toJSON();
    const blob = await Blob.create(
      {
        orgId: model.orgId,
        projectId: model.projectId,
        type: 'document',
        typeId: model.id,
        blob: simplified,
        deleted: false,
      },
      { transaction }
    );
    model.blobId = blob.id;
  }
}
