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
  },
  paid: {
    org: {
      maxUser: 500,
      maxUserPersonal: 10,
    },
    project: {
      max: 500,
    },
  },
};
