import type { ApiDocument } from 'api/src/types/api';

export const typeToText: Record<ApiDocument['type'], string> = {
  rfc: 'RFC',
  pb: 'PB',
};
