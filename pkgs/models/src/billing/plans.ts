export enum PlanName {
  'free' = 'free',
  'pro' = 'pro',
  'business' = 'business',
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  user: {
    max: number;
  };
  project: {
    max: number;
  };
  upload: {
    maxDocuments: number;
    maxDocumentSize: number;
  };
  deploy: {
    max: number;
  };
  price: { key: string; amount: number; currency: 'usd' };
  features: string[];
}

export const betaTrialEnd = new Date('2023-12-01T11:59:59Z');

export const v1: Record<PlanName, Plan> = {
  free: {
    id: 'prod_01d8ykCPVkHY2JVIwX8VWUr0',
    name: 'Free',
    description: 'Discover the platform and start building',
    user: {
      max: 5,
    },
    project: {
      max: 10,
    },
    upload: {
      maxDocuments: 50,
      maxDocumentSize: 1_999_999,
    },
    deploy: {
      max: 300,
    },
    price: { key: 'v1_free', amount: 0, currency: 'usd' },
    features: [],
  },
  pro: {
    id: 'prod_04d8ykCPVkHY2JVIwX8VWUr1',
    name: 'Pro',
    description: 'Perfect to get started and scale with your startup',
    user: {
      max: 50,
    },
    project: {
      max: 25,
    },
    upload: {
      maxDocuments: 100,
      maxDocumentSize: 9_999_999,
    },
    price: {
      key: 'v1.1_pro',
      amount: 20000,
      currency: 'usd',
    },
    deploy: {
      max: Infinity,
    },
    features: ['Email support'],
  },
  business: {
    id: 'prod_05d8ykCPVkHY2JVIwX8VWUr2',
    name: 'Business',
    description: 'Fit your fast growing company',
    user: {
      max: 250,
    },
    project: {
      max: 100,
    },
    upload: {
      maxDocuments: 300,
      maxDocumentSize: 9_999_999,
    },
    price: {
      key: 'v1.1_business',
      amount: 64900,
      currency: 'usd',
    },
    deploy: {
      max: Infinity,
    },
    features: ['Priority support'],
  },
};
