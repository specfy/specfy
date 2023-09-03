import type { ComponentType } from './types.js';

export const componentTypes: ComponentType[] = [
  'app',
  'ci',
  'db',
  'hosting',
  'language',
  'messaging',
  'network',
  'saas',
  'storage',
  'tool',
  'project',
  'service',
];

export const supportedTypeToText: Record<ComponentType, string> = {
  analytics: 'analytics',
  api: 'api',
  app: 'application',
  ci: 'ci',
  db: 'database',
  etl: 'etl',
  hosting: 'hosting',
  language: 'language',
  messaging: 'queue',
  network: 'network',
  saas: 'third-party',
  storage: 'storage',
  tool: 'tool',
  project: 'project',
  service: 'service',
};

export const internalTypeToText: Record<ComponentType, string> = {
  service: 'Service',
  analytics: 'Analytics',
  api: 'API',
  app: 'Application',
  ci: 'CI',
  db: 'Database',
  etl: 'ETL',
  hosting: 'Hosting',
  language: 'Language',
  messaging: 'Messaging',
  network: 'Network',
  project: 'Project',
  saas: 'Saas',
  storage: 'Storage',
  tool: 'Tool',
};
