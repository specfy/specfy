export var PlanName;
(function (PlanName) {
    PlanName["free"] = "free";
    PlanName["pro"] = "pro";
    PlanName["business"] = "business";
})(PlanName || (PlanName = {}));
export const v1 = {
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
            maxDocumentSize: 1999999,
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
        description: 'Perfect to get started and scale with your startup',
        user: {
            max: 50,
        },
        project: {
            max: 25,
        },
        upload: {
            maxDocuments: 100,
            maxDocumentSize: 9999999,
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
    business: {
        id: 'prod_03d8ykCPVkHY2JVIwX8VWUr2',
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
            maxDocumentSize: 9999999,
        },
        price: {
            key: 'v1_business',
            amount: 24900,
            currency: 'usd',
        },
        deploy: {
            max: Infinity,
        },
        features: ['Priority support'],
    },
};
