import type { IconType } from '@icons-pack/react-simple-icons';
import {
  Digitalocean,
  Oracle,
  Alibabacloud,
  Vercel,
  Ovh,
  Amazonaws,
  Elixir,
  Swift,
  Dart,
  Ruby,
  Kotlin,
  Powershell,
  C,
  Html5,
  Python,
  Rust,
  Cplusplus,
  Go,
  Php,
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
  CssThree,
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
  { key: 'algolia', name: 'Algolia', type: 'db', Icon: Algolia },
  { key: 'alibabacloud', name: 'Alibaba Cloud', type: 'hosting', Icon: Alibabacloud },
  // { key: 'atlasdb', name: 'AtlasDB', type: 'tool' },
  { key: 'aws', name: 'AWS', type: 'hosting', Icon: Amazonaws },
  { key: 'azure', name: 'Azure', type: 'hosting', Icon: Microsoftazure },
  { key: 'bash', name: 'Bash', type: 'language', Icon: Gnubash },
  { key: 'c', name: 'C', type: 'language', Icon: C },
  { key: 'cplusplus', name: 'C++', type: 'language', Icon: Cplusplus },
  { key: 'csharp', name: 'C#', type: 'language' },
  { key: 'css', name: 'CSS', type: 'language', Icon: CssThree },
  { key: 'dart', name: 'Dart', type: 'language', Icon: Dart },
  { key: 'datadog', name: 'Datadog', type: 'sass', Icon: Datadog },
  { key: 'digitalocean', name: 'Digital Ocean', type: 'hosting', Icon: Digitalocean },
  { key: 'elasticsearch', name: 'Elasticsearch', type: 'db', Icon: Elasticsearch },
  { key: 'elixir', name: 'Elixir', type: 'language', Icon: Elixir },
  { key: 'eslint', name: 'Eslint', type: 'tool', Icon: Eslint },
  { key: 'gcp', name: 'GCP', type: 'hosting', Icon: Googlecloud },
  { key: 'golang', name: 'Go', type: 'language', Icon: Go },
  { key: 'html', name: 'HTML', type: 'language', Icon: Html5 },
  { key: 'java', name: 'Java', type: 'language' },
  { key: 'kotlin', name: 'Kotlin', type: 'language', Icon: Kotlin },
  { key: 'kubernetes', name: 'Kubernetes', type: 'hosting', Icon: Kubernetes },
  { key: 'nodejs', name: 'NodeJS', type: 'language', Icon: Nodedotjs },
  { key: 'oraclecloud', name: 'Oracle Cloud', type: 'hosting', Icon: Oracle },
  { key: 'ovh', name: 'OVH', type: 'hosting', Icon: Ovh },
  { key: 'php', name: 'PHP', type: 'language', Icon: Php },
  { key: 'pingom', name: 'Pingdom', type: 'sass', Icon: Pingdom },
  { key: 'postgresql', name: 'Postgresql', type: 'db', Icon: Postgresql },
  { key: 'powershell', name: 'Powershell', type: 'language', Icon: Powershell },
  { key: 'python', name: 'Python', type: 'language', Icon: Python },
  { key: 'rabbitmq', name: 'RabbitMQ', type: 'messaging', Icon: Rabbitmq },
  { key: 'react', name: 'React', type: 'language', Icon: ReactJs },
  { key: 'redis', name: 'Redis', type: 'db', Icon: Redis },
  { key: 'ruby', name: 'Ruby', type: 'language', Icon: Ruby },
  { key: 'rust', name: 'Rust', type: 'language', Icon: Rust },
  { key: 'sentry', name: 'Sentry', type: 'sass', Icon: Sentry },
  { key: 'swift', name: 'Swift', type: 'language', Icon: Swift },
  { key: 'typescript', name: 'Typescript', type: 'language', Icon: Typescript },
  { key: 'vercel', name: 'Vercel', type: 'hosting', Icon: Vercel },
  { key: 'webpack', name: 'Webpack', type: 'tool', Icon: Webpack },
];

export const supportedIndexed: Record<string, TechInfo> = {};
Object.values(supportedArray).forEach((v) => {
  supportedIndexed[v.key] = v;
});
