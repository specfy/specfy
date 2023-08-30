import type { ApiBlobCreate, ApiBlobCreateComponent } from '../revisions';

export interface StackToBlobs {
  deleted: ApiBlobCreate[];
  blobs: ApiBlobCreateComponent[];
  unchanged: string[];
  stats: {
    created: number;
    modified: number;
    deleted: number;
    unchanged: number;
  };
}
