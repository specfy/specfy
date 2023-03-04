import type { IconType } from '@icons-pack/react-simple-icons';
import {
  Microsoftazure,
  Eslint,
  Pingdom,
  Postgresql,
  Redis,
  Rabbitmq,
  Sentry,
  Datadog,
  Algolia,
  Elasticsearch,
  Kubernetes,
  Googlecloud,
  Typescript,
  ReactJs,
  Webpack,
  Nodedotjs,
  Gnubash,
} from '@icons-pack/react-simple-icons';

/*
 a: {
   type: '',
   Icon: ,
 },
*/
export interface TechInfo {
  key: string;
  name: string;
  Icon?: IconType;
  type: 'db' | 'hosting' | 'language' | 'messaging' | 'sass' | 'tool';
}

// prettier-ignore
export const supportedArray: TechInfo[] = [
  { key: 'azure', name: 'Azure', type: 'hosting', Icon: Microsoftazure },
  { key: 'algolia', name: 'Algolia', type: 'db', Icon: Algolia },
  { key: 'atlasdb', name: 'AtlasDB', type: 'tool' },
  { key: 'bash', name: 'Bash', type: 'language', Icon: Gnubash },
  { key: 'datadog', name: 'Datadog', type: 'sass', Icon: Datadog },
  { key: 'elasticsearch', name: 'Elasticsearch', type: 'db', Icon: Elasticsearch },
  { key: 'eslint', name: 'Eslint', type: 'tool', Icon: Eslint },
  { key: 'gcp', name: 'GCP', type: 'hosting', Icon: Googlecloud },
  { key: 'kubernetes', name: 'Kubernetes', type: 'hosting', Icon: Kubernetes },
  { key: 'nodejs', name: 'NodeJS', type: 'language', Icon: Nodedotjs },
  { key: 'pingom', name: 'Pingdom', type: 'sass', Icon: Pingdom },
  { key: 'postgresql', name: 'Postgresql', type: 'db', Icon: Postgresql },
  { key: 'rabbitmq', name: 'RabbitMQ', type: 'messaging', Icon: Rabbitmq },
  { key: 'react', name: 'React', type: 'language', Icon: ReactJs },
  { key: 'redis', name: 'Redis', type: 'db', Icon: Redis },
  { key: 'sentry', name: 'Sentry', type: 'sass', Icon: Sentry },
  { key: 'typescript', name: 'Typescript', type: 'language', Icon: Typescript },
  { key: 'webpack', name: 'Webpack', type: 'tool', Icon: Webpack },
];

export const supportedIndexed: Record<string, TechInfo> = {};
Object.values(supportedArray).forEach((v) => {
  supportedIndexed[v.key] = v;
});
