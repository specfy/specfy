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
import { nanoid } from '@specfy/api/src/common/id';
import {
  hDef,
  hDefHost,
  wDef,
  wDefHost,
} from '@specfy/api/src/common/validators/flow.constants';
import type { ApiComponent } from '@specfy/api/src/types/api';
import type { FlowEdge } from '@specfy/api/src/types/db';
import type { AllowedKeys, TechItem } from '@specfy/stack-analyser';
import { list } from '@specfy/stack-analyser/dist/common/techs';

import { getEmptyDoc } from './content';
import type { ComponentsState, ProjectState } from './store';

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
export function getAllChilds(
  components: ApiComponent[],
  id: string
): ApiComponent[] {
  const tmp = [];
  for (const component of components) {
    if (component.inComponent === id) {
      tmp.push(component);
      tmp.push(...getAllChilds(components, component.id));
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
