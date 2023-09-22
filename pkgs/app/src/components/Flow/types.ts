import type { Connection, EdgeChange, NodeChange } from 'reactflow';

import type { TechSearchItem } from '../StackSearch/TechSearch';

export type BatchNodeUpdate = {
  id: string;
  size: { width: number; height: number };
  position?: { x: number; y: number };
};
export type NodeChangeSuper =
  | NodeChange
  | {
      id: string;
      type: 'group';
      parentId: string;
    }
  | {
      id: string;
      type: 'rename';
      name: string;
    }
  | {
      id: string;
      type: 'tech';
      tech: TechSearchItem | null;
    }
  | {
      id: string;
      type: 'ungroup';
    }
  | {
      id: string;
      type: 'visibility';
    }
  | {
      type: 'batch';
      changes: BatchNodeUpdate[];
    };

export type OnNodesChangeSuper = (changes: NodeChangeSuper[]) => void;

export type EdgeChangeSuper =
  | EdgeChange
  | {
      id: string;
      type: 'changeTarget';
      source: string;
      newSourceHandle: string;
      oldTarget: string;
      newTarget: string;
      newTargetHandle: string;
      show?: boolean;
    }
  | {
      type: 'create';
      conn: Connection;
    }
  | {
      type: 'direction';
      id: string;
      read: boolean;
      write: boolean;
    }
  | {
      type: 'visibility';
      id: string;
    };
export type OnEdgesChangeSuper = (changes: EdgeChangeSuper[]) => void;
