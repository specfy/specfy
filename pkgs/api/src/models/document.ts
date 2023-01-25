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

import type { DBDocument } from '../types/db/documents';

import type { Org } from './org';
import type { Project } from './project';

@Table({ tableName: 'documents', modelName: 'document' })
export class Document extends Model<
  DBDocument,
  Pick<
    DBDocument,
    | 'blocks'
    | 'locked'
    | 'name'
    | 'orgId'
    | 'projectId'
    | 'status'
    | 'tldr'
    | 'type'
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
  declare blocks: CreationOptional<Record<string, any>>;
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
  static async before(model: Document): Promise<void> {
    model.slug = slugify(model.name, { lower: true, trim: true });
    model.typeId =
      (await this.count({
        where: {
          orgId: model.orgId,
        },
      })) + 1;
  }
}
