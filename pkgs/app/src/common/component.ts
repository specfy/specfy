import type { IconType } from '@icons-pack/react-simple-icons';
import {
  Mongodb,
  Elasticcloud,
  Zapier,
  Zoom,
  Mailchimp,
  Netlify,
  Jira,
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
import type { ApiComponent } from 'api/src/types/api';
import type { GraphEdge } from 'api/src/types/db';

import { getEmptyDoc } from '../components/Editor/helpers';

import type { ComponentsState, ProjectState } from './store';

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
  { key: 'elasticloud', name: 'Elastic Cloud', type: 'sass', Icon: Elasticcloud },
  { key: 'elixir', name: 'Elixir', type: 'language', Icon: Elixir },
  { key: 'eslint', name: 'Eslint', type: 'tool', Icon: Eslint },
  { key: 'gce', name: 'GCE', type: 'hosting', Icon: Googlecloud },
  { key: 'gcp', name: 'GCP', type: 'hosting', Icon: Googlecloud },
  { key: 'golang', name: 'Go', type: 'language', Icon: Go },
  { key: 'html', name: 'HTML', type: 'language', Icon: Html5 },
  { key: 'java', name: 'Java', type: 'language' },
  { key: 'jira', name: 'Jira', type: 'sass', Icon: Jira },
  { key: 'kotlin', name: 'Kotlin', type: 'language', Icon: Kotlin },
  { key: 'kubernetes', name: 'Kubernetes', type: 'hosting', Icon: Kubernetes },
  { key: 'mailchimp', name: 'Mailchimp', type: 'sass', Icon: Mailchimp },
  { key: 'netlify', name: 'Netlify', type: 'hosting', Icon: Netlify },
  { key: 'newrelic', name: 'New Relic', type: 'sass', Icon: Newrelic },
  { key: 'nodejs', name: 'NodeJS', type: 'language', Icon: Nodedotjs },
  { key: 'oraclecloud', name: 'Oracle Cloud', type: 'hosting', Icon: Oracle },
  { key: 'ovh', name: 'OVH', type: 'hosting', Icon: Ovh },
  { key: 'php', name: 'PHP', type: 'language', Icon: Php },
  { key: 'pingdom', name: 'Pingdom', type: 'sass', Icon: Pingdom },
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
  { key: 'zapier', name: 'Zapier', type: 'sass', Icon: Zapier },
  { key: 'zoom', name: 'Zoom', type: 'sass', Icon: Zoom },
  { key: 'mongodb', name: 'MongoDB', type: 'db', Icon: Mongodb },
];

export const supportedIndexed: Record<string, TechInfo> = {};
Object.values(supportedArray).forEach((v) => {
  supportedIndexed[v.key] = v;
});

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
): { source: GraphEdge['portSource']; target: GraphEdge['portTarget'] } {
  const isCurrentAbove =
    a.display.pos.y + a.display.pos.height < b.display.pos.y;
  const isCurrentBelow =
    a.display.pos.y > b.display.pos.y + b.display.pos.height;
  const isCurrentRight =
    a.display.pos.x > b.display.pos.x + b.display.pos.width;
  const isCurrentLeft = a.display.pos.x + a.display.pos.x < b.display.pos.x;

  let source: GraphEdge['portSource'] = 'left';
  let target: GraphEdge['portTarget'] = 'right';
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
    tech: null,
    display: { pos: { x: 0, y: 0, width: 100, height: 32 } },
    edges: [],
    blobId: '',
    inComponent: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  storeComponents.create(add);
  return id;
}
