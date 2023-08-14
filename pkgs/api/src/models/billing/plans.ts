export enum PlanName {
  'free' = 'free',
  'pro' = 'pro',
  'enterprise' = 'enterprise',
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

export const v1: Record<PlanName, Plan> = {
  free: {
    id: 'prod_01d8ykCPVkHY2JVIwX8VWUr0',
    name: 'Free',
    description: 'Discover the platform and start building',
    user: {
      max: 5,
    },
    project: {
      max: 3,
    },
    upload: {
      maxDocuments: 25,
      maxDocumentSize: 1_999_999,
    },
    deploy: {
      max: 300,
    },
    price: { key: 'v1_free', amount: 0, currency: 'usd' },
    features: [],
  },
  pro: {
    id: 'prod_02d8ykCPVkHY2JVIwX8VWUr1',
    name: 'Pro',
    description: 'Perfect for medium sized company and fast growing company',
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
      key: 'v1_pro',
      amount: 2000,
      currency: 'usd',
    },
    deploy: {
      max: Infinity,
    },
    features: ['Email support'],
  },
  enterprise: {
    id: 'prod_03d8ykCPVkHY2JVIwX8VWUr2',
    name: 'Business',
    description: 'Everything unlocked',
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
      key: 'v1_enterprise',
      amount: 20000,
      currency: 'usd',
    },
    deploy: {
      max: Infinity,
    },
    features: ['Priority support'],
  },
};
