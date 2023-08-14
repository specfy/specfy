export declare enum PlanName {
    'free' = "free",
    'pro' = "pro",
    'business' = "business"
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
    price: {
        key: string;
        amount: number;
        currency: 'usd';
    };
    features: string[];
}
export declare const v1: Record<PlanName, Plan>;
