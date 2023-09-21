import type { FlowEdge, HandlePosition } from './types.js';

export const min = -99999;
export const max = 99999;
export const wMin = 100;
export const wMax = 2000;
export const hMin = 40;
export const hMax = 2000;

export const hDef = 40;
export const wDef = 100;
export const hDefHost = 72;
export const wDefHost = 200;

export const mapSourceHandle: Record<FlowEdge['portSource'], HandlePosition> = {
  st: 'top',
  sr: 'right',
  sb: 'bottom',
  sl: 'left',
};
export const mapSourceHandleReverse: Record<
  HandlePosition,
  FlowEdge['portSource']
> = {
  top: 'st',
  right: 'sr',
  bottom: 'sb',
  left: 'sl',
};

export const mapTargetHandle: Record<FlowEdge['portTarget'], HandlePosition> = {
  tt: 'top',
  tr: 'right',
  tb: 'bottom',
  tl: 'left',
};
export const mapTargetHandleReverse: Record<
  HandlePosition,
  FlowEdge['portTarget']
> = {
  top: 'tt',
  right: 'tr',
  bottom: 'tb',
  left: 'tl',
};
