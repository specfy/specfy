export interface FlowItemDisplay {
  zIndex?: number;
  color?: string;
  backgroundColor?: string;
  pos: { x: number; y: number };
  size: { width: number; height: number };
}

export interface FlowEdge {
  to: string;
  read: boolean;
  write: boolean;
  vertices: Array<{ x: number; y: number }>;
  portSource: 'bottom' | 'left' | 'right' | 'top';
  portTarget: 'bottom' | 'left' | 'right' | 'top';
}
