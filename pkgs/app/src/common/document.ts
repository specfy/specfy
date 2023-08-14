import type { ApiDocument } from '@specfy/models';

export const TYPE_TO_TEXT: Record<ApiDocument['type'], string> = {
  rfc: 'RFC',
  pb: 'PB',
  doc: 'DOC',
};

export const TYPE_TO_READABLE: Record<ApiDocument['type'], string> = {
  rfc: 'RFC',
  pb: 'Playbook',
  doc: 'Document',
};
