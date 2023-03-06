export interface GraphItemDisplay {
  zIndex?: number;
  color?: string;
  backgroundColor?: string;
  pos: { x: number; y: number; width: number; height: number };
}

export interface GraphEdge {
  to: string;
  read: boolean;
  write: boolean;
  vertices: Array<{ x: number; y: number }>;
  portSource: 'bottom' | 'left' | 'right' | 'top';
  portTarget: 'bottom' | 'left' | 'right' | 'top';
}
