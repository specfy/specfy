import type { IconType } from '@icons-pack/react-simple-icons';
import {
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
import { nanoid } from 'api/src/common/id';
import {
  hDef,
  hDefHost,
  wDef,
  wDefHost,
} from 'api/src/common/validators/flow.constants';
import type { ApiComponent } from 'api/src/types/api';
import type { FlowEdge } from 'api/src/types/db';

import { getEmptyDoc } from './content';
import type { ComponentsState, ProjectState } from './store';

export interface TechInfo {
  key: string;
  name: string;
  Icon?: IconType;
  type: 'db' | 'hosting' | 'language' | 'messaging' | 'sass' | 'tool';
  regHostname?: RegExp;
}

// prettier-ignore
export const supportedArray: TechInfo[] = [
  { key: 'algolia', name: 'Algolia', type: 'db', Icon: Algolia },
  { key: 'alibabacloud', name: 'Alibaba Cloud', type: 'hosting', Icon: Alibabacloud },
  { key: 'aws', name: 'AWS', type: 'hosting', Icon: Amazonaws, regHostname: /aws.amazon.com$/ },
  { key: 'azure', name: 'Azure', type: 'hosting', Icon: Microsoftazure },
  { key: 'bash', name: 'Bash', type: 'language', Icon: Gnubash },
  { key: 'c', name: 'C', type: 'language', Icon: C },
  { key: 'cplusplus', name: 'C++', type: 'language', Icon: Cplusplus },
  { key: 'csharp', name: 'C#', type: 'language' },
  { key: 'css', name: 'CSS', type: 'language', Icon: CssThree },
  { key: 'dart', name: 'Dart', type: 'language', Icon: Dart },
  { key: 'datadog', name: 'Datadog', type: 'sass', Icon: Datadog, regHostname: /^(www.)?datadog.com$/ },
  { key: 'digitalocean', name: 'Digital Ocean', type: 'hosting', Icon: Digitalocean },
  { key: 'elasticloud', name: 'Elastic Cloud', type: 'sass', Icon: Elasticcloud },
  { key: 'elasticsearch', name: 'Elasticsearch', type: 'db', Icon: Elasticsearch },
  { key: 'elixir', name: 'Elixir', type: 'language', Icon: Elixir },
  { key: 'eslint', name: 'Eslint', type: 'tool', Icon: Eslint },
  { key: 'gce', name: 'GCE', type: 'hosting', Icon: Googlecloud },
  { key: 'gcp', name: 'GCP', type: 'hosting', Icon: Googlecloud },
  { key: 'github', name: 'Github', type: 'sass', Icon: Github, regHostname: /^(www.)?github.com$/ },
  { key: 'golang', name: 'Go', type: 'language', Icon: Go },
  { key: 'html', name: 'HTML', type: 'language', Icon: Html5 },
  { key: 'java', name: 'Java', type: 'language' },
  { key: 'jira', name: 'Jira', type: 'sass', Icon: Jirasoftware, regHostname: /.atlassian.net$/ },
  { key: 'kotlin', name: 'Kotlin', type: 'language', Icon: Kotlin },
  { key: 'kubernetes', name: 'Kubernetes', type: 'hosting', Icon: Kubernetes },
  { key: 'mailchimp', name: 'Mailchimp', type: 'sass', Icon: Mailchimp },
  { key: 'mongodb', name: 'MongoDB', type: 'db', Icon: Mongodb },
  { key: 'netlify', name: 'Netlify', type: 'hosting', Icon: Netlify, regHostname: /^(www.)?netlify.com$/ },
  { key: 'newrelic', name: 'New Relic', type: 'sass', Icon: Newrelic },
  { key: 'nodejs', name: 'NodeJS', type: 'language', Icon: Nodedotjs },
  { key: 'oraclecloud', name: 'Oracle Cloud', type: 'hosting', Icon: Oracle },
  { key: 'ovh', name: 'OVH', type: 'hosting', Icon: Ovh },
  { key: 'php', name: 'PHP', type: 'language', Icon: Php },
  { key: 'pingdom', name: 'Pingdom', type: 'sass', Icon: Pingdom, regHostname: /^(www.)?pingdom.com$/ },
  { key: 'postgresql', name: 'Postgresql', type: 'db', Icon: Postgresql },
  { key: 'powershell', name: 'Powershell', type: 'language', Icon: Powershell },
  { key: 'pubsub', name: 'PubSub', type: 'messaging', Icon: Googlecloud },
  { key: 'python', name: 'Python', type: 'language', Icon: Python },
  { key: 'rabbitmq', name: 'RabbitMQ', type: 'messaging', Icon: Rabbitmq },
  { key: 'react', name: 'React', type: 'language', Icon: ReactJs },
  { key: 'redis', name: 'Redis', type: 'db', Icon: Redis },
  { key: 'ruby', name: 'Ruby', type: 'language', Icon: Ruby },
  { key: 'rust', name: 'Rust', type: 'language', Icon: Rust },
  { key: 'sentry', name: 'Sentry', type: 'sass', Icon: Sentry, regHostname: /^(www.)?sentry.com$/ },
  { key: 'slack', name: 'Slack', type: 'sass', Icon: Slack, regHostname: /^(www.)?slack.com$/ },
  { key: 'swift', name: 'Swift', type: 'language', Icon: Swift },
  { key: 'typescript', name: 'Typescript', type: 'language', Icon: Typescript },
  { key: 'vercel', name: 'Vercel', type: 'hosting', Icon: Vercel },
  { key: 'webpack', name: 'Webpack', type: 'tool', Icon: Webpack },
  { key: 'zapier', name: 'Zapier', type: 'sass', Icon: Zapier, regHostname: /^(www.)?zapier.com$/ },
  { key: 'zoom', name: 'Zoom', type: 'sass', Icon: Zoom },
];

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
};

export const internalTypeToText: Record<ApiComponent['type'], string> = {
  component: 'Service',
  hosting: 'Hosting',
  project: 'Project',
  thirdparty: 'Third-Party',
};

/**
 * Position the edge on port from a to b.
 */
export function positionEdge(
  a: ApiComponent,
  b: ApiComponent
): { source: FlowEdge['portSource']; target: FlowEdge['portTarget'] } {
  const isCurrentAbove =
    a.display.pos.y + a.display.size.height < b.display.pos.y;
  const isCurrentBelow =
    a.display.pos.y > b.display.pos.y + b.display.size.height;
  const isCurrentRight =
    a.display.pos.x > b.display.pos.x + b.display.size.width;
  const isCurrentLeft = a.display.pos.x + a.display.pos.x < b.display.pos.x;

  let source: FlowEdge['portSource'] = 'left';
  let target: FlowEdge['portTarget'] = 'right';
  if (isCurrentLeft) {
    source = 'right';
    target = 'left';
  } else if (isCurrentAbove && !isCurrentRight) {
    source = 'bottom';
    target = 'top';
  } else if (isCurrentBelow) {
    source = 'top';
    target = 'bottom';
  }

  return { source, target };
}

/**
 * Get all childs of a component.
 */
export function getAllChilds(list: ApiComponent[], id: string): ApiComponent[] {
  const tmp = [];
  for (const c of list) {
    if (c.inComponent === id) {
      tmp.push(c);
      tmp.push(...getAllChilds(list, c.id));
    }
  }
  return tmp;
}

export function createLocal(
  data: Partial<Pick<ApiComponent, 'techId' | 'typeId'>> &
    Pick<ApiComponent, 'name' | 'slug' | 'type'>,
  storeProject: ProjectState,
  storeComponents: ComponentsState
) {
  const id = nanoid();

  const size =
    data.type === 'hosting'
      ? { width: wDefHost, height: hDefHost }
      : { width: wDef, height: hDef };

  // Compute global bounding box
  const global = { x: 0, y: 0, width: 0, height: 0 };
  for (const component of Object.values(storeComponents.components)) {
    global.x = Math.min(component.display.pos.x, global.x);
    global.y = Math.min(component.display.pos.y, global.y);
    global.width = Math.max(component.display.size.width, global.width);
    global.height = Math.max(component.display.size.height, global.height);
  }

  // Simply add on top of it
  const pos = { x: global.x, y: global.y - size.height };

  const add: ApiComponent = {
    id: id,
    orgId: storeProject.project!.id,
    projectId: storeProject.project!.id,
    techId: data.techId || null,
    type: data.type,
    typeId: data.typeId || null,
    name: data.name,
    slug: data.slug,
    description: getEmptyDoc(),
    tech: [],
    display: { pos: pos, size },
    edges: [],
    blobId: '',
    inComponent: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  storeComponents.create(add);
  return id;
}
