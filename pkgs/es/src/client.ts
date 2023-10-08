import { Client } from '@elastic/elasticsearch';
import { envs } from '@specfy/core';

export const client = new Client({
  nodes: envs.ELASTICSEARCH_HOST,
  requestTimeout: 5000,
  maxRetries: 1,
  auth: { username: envs.ELASTICSEARCH_USER, password: envs.ELASTICSEARCH_PWD },
});
