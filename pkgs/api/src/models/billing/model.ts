export enum Plan {
  'free' = 'free',
  'pro' = 'pro',
  'enterprise' = 'enterprise',
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
      maxUser: 5,
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
  pro: {
    org: {
      maxUser: 100,
      maxUserPersonal: 10,
    },
    project: {
      max: 50,
    },
    upload: {
      maxDocuments: 300,
      maxDocumentSize: 9_999_999,
    },
  },
  enterprise: {
    org: {
      maxUser: 1000,
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
