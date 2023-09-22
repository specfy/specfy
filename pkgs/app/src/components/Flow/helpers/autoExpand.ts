import type { ComputedFlow, ComputedNode } from '@specfy/models';

import type { BatchNodeUpdate } from '../types';

/**
 * Automatically expand host nodes when dragging a node inside.
 * Right now it's only pushing boundaries not the node outside
 */
export function autoExpand(
  flow: ComputedFlow,
  node: ComputedNode,
  evt: Pick<React.MouseEvent<Element, MouseEvent>, 'movementX' | 'movementY'>
) {
  const pad = 20;
  const par = flow.nodes.find((n) => n.id === node.parentNode)!;
  const changes: BatchNodeUpdate[] = [];
  const size = par.data.originalSize;
  const pos = par.position;
  let width: number | undefined;
  let height: number | undefined;
  let x: number | undefined;
  let y: number | undefined;

  if (evt.movementX > 0) {
    // Pushing RIGHT
    const xR = node.position.x + node.data.originalSize.width;
    const diff = xR >= size.width! - pad;

    if (diff) {
      width = size.width + Math.max(xR - (size.width - pad), evt.movementX);
    }
  } else if (evt.movementX < 0) {
    // Pushing LEFT
    const diff = node.position.x < pad;
    const incr = Math.round(
      Math.max(5, Math.abs(evt.movementX), pad - node.position.x)
    );

    if (diff) {
      width = Math.max(size.width + incr, size.width);
      x = pos.x - incr;
    }
  }
  if (evt.movementY > 0) {
    // Pushing BOT
    const yB = node.position.y + node.data.originalSize.height;
    const diff = yB > size.height - pad;

    if (diff) {
      height = Math.max(
        size.height + Math.max(yB - (size.height - pad), evt.movementY),
        size.height
      );
    }
  } else if (evt.movementY < 0) {
    // Pushing TOP
    const diff = node.position.y < pad;
    const incr = Math.round(
      Math.max(5, Math.abs(evt.movementY), pad - node.position.y)
    );

    if (diff) {
      height = Math.max(size.height + incr, size.height);
      y = pos.y - incr;
    }
  }

  if (width || height || x || y) {
    // we first modify the host
    changes.push({
      id: par.id,
      size: {
        width: width ? Math.round(width) : size.width,
        height: height ? Math.round(height) : size.height,
      },
      position: { x: x || pos.x, y: y || pos.y },
    });

    if (x || y) {
      // Then try to reposition the node a the correct spot
      changes.push({
        id: node.id,
        size: { ...node.data.originalSize },
        position: {
          y: y ? pad + 1 : node.position.y,
          x: x ? pad + 1 : node.position.x,
        },
      });
    }
  }

  return changes;
}
