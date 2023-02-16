import type { IconType } from '@icons-pack/react-simple-icons';
import {
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
  name: string;
  Icon?: IconType;
  type: 'db' | 'hosting' | 'language' | 'messaging' | 'sass' | 'tool';
}

export const supported: Record<string, TechInfo> = {
  atlasdb: { name: 'AtlasDB', type: 'tool' },
  algolia: { name: 'Algolia', type: 'db', Icon: Algolia },
  datadog: { name: 'Datadog', type: 'sass', Icon: Datadog },
  sentry: { name: 'Sentry', type: 'sass', Icon: Sentry },
  elasticsearch: { name: 'Elasticsearch', type: 'db', Icon: Elasticsearch },
  gcp: { name: 'GCP', type: 'hosting', Icon: Googlecloud },
  kubernetes: { name: 'Kubernetes', type: 'hosting', Icon: Kubernetes },
  bash: { name: 'Bash', type: 'language', Icon: Gnubash },
  nodejs: { name: 'NodeJS', type: 'language', Icon: Nodedotjs },
  typescript: { name: 'Typescript', type: 'language', Icon: Typescript },
  rabbitmq: { name: 'RabbitMQ', type: 'messaging', Icon: Rabbitmq },
  react: { name: 'React', type: 'language', Icon: ReactJs },
  postgresql: { name: 'Postgresql', type: 'db', Icon: Postgresql },
  redis: { name: 'Redis', type: 'db', Icon: Redis },
  webpack: { name: 'Webpack', type: 'tool', Icon: Webpack },
};
