import type { Config } from '@specfy/sync';
import type { RequiredDeep } from 'type-fest';
import type { BlockLevelZero } from '../documents';
export interface DBProject {
    id: string;
    orgId: string;
    blobId: string | null;
    slug: string;
    name: string;
    description: BlockLevelZero;
    links: DBProjectLink[];
    githubRepository: string | null;
    config: RequiredDeep<Omit<Config, 'orgId' | 'projectId'>>;
    createdAt: string;
    updatedAt: string;
}
export interface DBProjectLink {
    title: string;
    url: string;
}
