export interface FlowItemDisplay {
  zIndex?: number;
  color?: string;
  backgroundColor?: string;
  pos: { x: number; y: number };
  size: { width: number; height: number };
}

export interface FlowEdge {
  target: string;
  read: boolean;
  write: boolean;
  vertices: Array<{ x: number; y: number }>;
  portSource: 'sb' | 'sl' | 'sr' | 'st';
  portTarget: 'tb' | 'tl' | 'tr' | 'tt';
}
