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
export const supported: Record<
  string,
  {
    Icon?: IconType;
    type: 'db' | 'hosting' | 'language' | 'messaging' | 'sass' | 'tool';
  }
> = {
  AtlasDB: {
    type: 'language',
  },
  Algolia: {
    type: 'db',
    Icon: Algolia,
  },
  Datadog: {
    type: 'sass',
    Icon: Datadog,
  },
  Sentry: {
    type: 'sass',
    Icon: Sentry,
  },
  Elasticsearch: {
    type: 'db',
    Icon: Elasticsearch,
  },
  GCP: {
    type: 'hosting',
    Icon: Googlecloud,
  },
  Kubernetes: {
    type: 'hosting',
    Icon: Kubernetes,
  },
  Bash: {
    type: 'language',
    Icon: Gnubash,
  },
  NodeJS: {
    type: 'language',
    Icon: Nodedotjs,
  },
  Typescript: {
    type: 'language',
    Icon: Typescript,
  },
  RabbitMQ: {
    type: 'messaging',
    Icon: Rabbitmq,
  },
  React: {
    type: 'language',
    Icon: ReactJs,
  },
  Postgresql: {
    type: 'db',
    Icon: Postgresql,
  },
  Redis: {
    type: 'db',
    Icon: Redis,
  },
  Webpack: {
    type: 'tool',
    Icon: Webpack,
  },
};
