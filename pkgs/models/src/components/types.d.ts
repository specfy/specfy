import type { TechType } from '@specfy/stack-analyser';
import type { BlockLevelZero } from '../documents';
import type { FlowEdge, FlowItemDisplay } from '../flows/types.js';
export type ComponentType = TechType | 'project' | 'service';
export interface DBComponent {
    id: string;
    orgId: string;
    projectId: string;
    blobId: string | null;
    techId: string | null;
    type: ComponentType;
    typeId: string | null;
    name: string;
    slug: string;
    description: BlockLevelZero;
    techs: string[];
    display: FlowItemDisplay;
    edges: FlowEdge[];
    inComponent: string | null;
    source: string | null;
    sourceName: string | null;
    sourcePath: string[] | null;
    show: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}
