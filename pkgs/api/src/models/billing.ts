export enum Plan {
  'free' = 'free',
  'paid' = 'paid',
}

export interface Billing {
  org: {
    maxUser: number;
    maxUserPersonal: number;
  };
  project: {
    max: number;
  };
  upload: {
    maxDocuments: number;
    maxDocumentSize: number;
  };
}

export const v1: Record<Plan, Billing> = {
  free: {
    org: {
      maxUser: 3,
      maxUserPersonal: 10,
    },
    project: {
      max: 3,
    },
    upload: {
      maxDocuments: 100,
      maxDocumentSize: 1_999_999,
    },
  },
  paid: {
    org: {
      maxUser: 500,
      maxUserPersonal: 10,
    },
    project: {
      max: 500,
    },
    upload: {
      maxDocuments: 300,
      maxDocumentSize: 9_999_999,
    },
  },
};
