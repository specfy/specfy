import type { ApiComponent } from '../components';
import type { ComputedFlow } from './types.js';
export declare function computeNewProjectPosition(flow: ComputedFlow): {
    x: number;
    y: number;
};
export declare function computeWidth(name: string, min: number, max: number): number;
export declare function getComponentSize(type: ApiComponent['type'], name: ApiComponent['name']): ApiComponent['display']['size'];
