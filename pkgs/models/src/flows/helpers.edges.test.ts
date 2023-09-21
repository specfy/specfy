import { describe, expect, it } from 'vitest';

import { getBestHandlePosition } from './helpers.edges.js';

describe('getBestHandlePosition', () => {
  it('should be right to left', () => {
    const res = getBestHandlePosition(
      { positionAbsolute: { x: 0, y: 0 }, width: 20, height: 20 },
      { positionAbsolute: { x: 40, y: 0 }, width: 20, height: 20 }
    );

    expect(res).toStrictEqual({
      newSource: 'right',
      newTarget: 'left',
    });
  });

  it('should be left to right', () => {
    const res = getBestHandlePosition(
      { positionAbsolute: { x: 0, y: 0 }, width: 20, height: 20 },
      { positionAbsolute: { x: -40, y: 0 }, width: 20, height: 20 }
    );

    expect(res).toStrictEqual({
      newSource: 'left',
      newTarget: 'right',
    });
  });

  it('should be top to bottom', () => {
    const res = getBestHandlePosition(
      { positionAbsolute: { x: 0, y: 0 }, width: 20, height: 20 },
      { positionAbsolute: { x: 0, y: -40 }, width: 20, height: 20 }
    );

    expect(res).toStrictEqual({
      newSource: 'top',
      newTarget: 'bottom',
    });
  });

  it('should be bottom to top', () => {
    const res = getBestHandlePosition(
      { positionAbsolute: { x: 0, y: 0 }, width: 20, height: 20 },
      { positionAbsolute: { x: 0, y: 40 }, width: 20, height: 20 }
    );

    expect(res).toStrictEqual({
      newSource: 'bottom',
      newTarget: 'top',
    });
  });
});
