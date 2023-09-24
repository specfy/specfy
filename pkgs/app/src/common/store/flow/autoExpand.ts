import type { ComputedNode } from '@specfy/models';

/**
 * Automatically expand host nodes when dragging a node inside.
 * Right now it's only pushing boundaries not the node outside
 */
export function autoExpand(node: ComputedNode, nodes: ComputedNode[]): void {
  const pad = 5;
  const par = nodes.find((n) => n.id === node.parentNode)!;
  const pos = par.position;

  const exWidth = node.position.x + node.width! - (par.width! - pad);
  const exHeight = node.position.y + node.height! - (par.height! - pad);

  if (exWidth > 0) {
    // Pushing RIGHT
    par.width! += exWidth;
  } else if (node.position.x < pad) {
    // Pushing LEFT
    const incr = Math.abs(node.position.x);
    par.width! += incr;
    par.position.x = pos.x - incr;
    node.position.x = pad;
  }

  if (exHeight > 0) {
    // Pushing BOT
    par.height! += exHeight;
  } else if (node.position.y < pad) {
    // Pushing TOP
    const incr = Math.abs(node.position.y);
    par.height! += incr;
    par.position.y = par.position.y - incr;
    node.position.y = pad;
  }

  par.width = Math.round(par.width!);
  par.height = Math.round(par.height!);
  par.style!.width = par.width!;
  par.style!.height = par.height!;
}
