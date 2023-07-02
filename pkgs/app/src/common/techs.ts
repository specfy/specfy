import type { IconType } from '@icons-pack/react-simple-icons';
import {
  Docker,
  Javascript,
  Jirasoftware,
  Github,
  Slack,
  Mongodb,
  Elasticcloud,
  Zapier,
  Zoom,
  Mailchimp,
  Netlify,
  Newrelic,
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
import type { ApiComponent } from '@specfy/api/src/types/api';
import type { AllowedKeys, TechItem } from '@specfy/stack-analyser';
import { list } from '@specfy/stack-analyser/dist/common/techs';

type Extending = {
  Icon?: IconType;
  regHostname?: RegExp;
};
export type TechInfo = Extending & TechItem;

// prettier-ignore
const extending: Partial<Record<AllowedKeys, Extending>> = {
  'algolia': { Icon: Algolia },
  'alibabacloud': { Icon: Alibabacloud },
  'aws': { Icon: Amazonaws, regHostname: /aws.amazon.com$/ },
  'azure': { Icon: Microsoftazure },
  'bash': { Icon: Gnubash },
  'c': { Icon: C },
  'cplusplus': { Icon: Cplusplus },
  'csharp': { },
  'css': { Icon: CssThree },
  'dart': { Icon: Dart },
  'datadog': { Icon: Datadog, regHostname: /^(www.)?datadog.com$/ },
  'digitalocean': { Icon: Digitalocean },
  'docker': { Icon: Docker },
  'elasticloud': { Icon: Elasticcloud },
  'elasticsearch': { Icon: Elasticsearch },
  'elixir': { Icon: Elixir },
  'eslint': { Icon: Eslint },
  'gce': { Icon: Googlecloud },
  'gcp': { Icon: Googlecloud },
  'github': { Icon: Github, regHostname: /^(www.)?github.com$/ },
  'golang': { Icon: Go },
  'html': { Icon: Html5 },
  'java': { },
  'javascript': { Icon: Javascript },
  'jira': { Icon: Jirasoftware, regHostname: /.atlassian.net$/ },
  'kotlin': { Icon: Kotlin },
  'kubernetes': { Icon: Kubernetes },
  'mailchimp': { Icon: Mailchimp },
  'mongodb': { Icon: Mongodb },
  'netlify': { Icon: Netlify, regHostname: /^(www.)?netlify.com$/ },
  'newrelic': { Icon: Newrelic },
  'nodejs': { Icon: Nodedotjs },
  'oraclecloud': { Icon: Oracle },
  'ovh': { Icon: Ovh },
  'php': { Icon: Php },
  'pingdom': { Icon: Pingdom, regHostname: /^(www.)?pingdom.com$/ },
  'postgresql': { Icon: Postgresql },
  'powershell': { Icon: Powershell },
  'pubsub': { Icon: Googlecloud },
  'python': { Icon: Python },
  'rabbitmq': { Icon: Rabbitmq },
  'react': { Icon: ReactJs },
  'redis': { Icon: Redis },
  'ruby': { Icon: Ruby },
  'rust': { Icon: Rust },
  'sentry': { Icon: Sentry, regHostname: /^(www.)?sentry.com$/ },
  'slack': { Icon: Slack, regHostname: /^(www.)?slack.com$/ },
  'swift': { Icon: Swift },
  'typescript': { Icon: Typescript },
  'vercel': { Icon: Vercel },
  'webpack': { Icon: Webpack },
  'zapier': { Icon: Zapier, regHostname: /^(www.)?zapier.com$/ },
  'zoom': { Icon: Zoom },
};

export const supportedArray: TechInfo[] = list.map((t) => {
  return { ...t, ...(extending[t.key] || {}) };
});

export const supportedIndexed: Record<string, TechInfo> = {};
Object.values(supportedArray).forEach((v) => {
  supportedIndexed[v.key] = v;
});

export const supportedHostname = supportedArray.filter((i) => i.regHostname);

export const supportedTypeToText: Record<TechInfo['type'], string> = {
  db: 'database',
  hosting: 'hosting',
  language: 'language',
  messaging: 'service',
  tool: 'tool',
  sass: 'third-party',
  app: 'application',
  ci: 'ci',
  network: 'network',
};

export const internalTypeToText: Record<ApiComponent['type'], string> = {
  service: 'Service',
  hosting: 'Hosting',
  project: 'Project',
  sass: 'Sass',
  db: 'Database',
  language: 'Language',
  messaging: 'Messaging',
  tool: 'Tool',
  app: 'Application',
  ci: 'CI',
  network: 'Network',
};
