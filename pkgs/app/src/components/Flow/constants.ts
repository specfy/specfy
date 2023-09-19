import { flip } from '@specfy/core/src/object';
import type { FlowEdge } from '@specfy/models';
import { Position } from 'reactflow';

export const mapSourceHandle: Record<FlowEdge['portSource'], Position> = {
  st: Position.Top,
  sr: Position.Right,
  sb: Position.Bottom,
  sl: Position.Left,
};
export const mapSourceHandleReverse: Record<Position, FlowEdge['portSource']> =
  flip(mapSourceHandle);

export const mapTargetHandle: Record<FlowEdge['portTarget'], Position> = {
  tt: Position.Top,
  tr: Position.Right,
  tb: Position.Bottom,
  tl: Position.Left,
};
export const mapTargetHandleReverse: Record<Position, FlowEdge['portTarget']> =
  flip(mapTargetHandle);
