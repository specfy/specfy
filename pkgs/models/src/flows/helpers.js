import { hDef, hDefHost, wDef, wDefHost, wMax } from './constants.js';
export function computeNewProjectPosition(flow) {
    // Compute global bounding box
    const global = { x: 0, y: 0 };
    for (const node of flow.nodes) {
        global.x = Math.min(node.position.x, global.x);
        global.y = Math.min(node.position.y, global.y);
    }
    // Simply add on top of it
    return { x: global.x, y: global.y - (hDef + 10) };
}
const iconSize = 21;
const padding = 6 * 2;
const gap = 2;
const char = 6;
export function computeWidth(name, min, max) {
    return Math.min(max, Math.max(min, name.length * char + padding + iconSize + gap)); // icon + gap + padding
}
export function getComponentSize(type, name) {
    return {
        height: type === 'hosting' ? hDefHost : hDef,
        width: type === 'hosting'
            ? computeWidth(name, wDefHost, wMax)
            : computeWidth(name, wDef, wMax),
    };
}
