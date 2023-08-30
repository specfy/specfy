import type { ApiBlobCreate, ApiBlobCreateComponent } from '../revisions';

export interface StackToBlobs {
  deleted: ApiBlobCreate[];
  blobs: ApiBlobCreateComponent[];
  unchanged: string[];
}
