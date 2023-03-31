import util from 'node:util';

import type { Dispatcher } from 'undici';
import { Client } from 'undici';

import type { ResErrors, ResValidationError } from '../types/api';
import type { API, APIPaths } from '../types/api/endpoints';

type GET<TPath extends APIPaths> = API[TPath] extends { GET: any }
  ? API[TPath]['GET']
  : never;
type POST<TPath extends APIPaths> = API[TPath] extends { POST: any }
  ? API[TPath]['POST']
  : never;
type PUT<TPath extends APIPaths> = API[TPath] extends { PUT: any }
  ? API[TPath]['PUT']
  : never;
type DELETE<TPath extends APIPaths> = API[TPath] extends { DELETE: any }
  ? API[TPath]['DELETE']
  : never;

export function isError(json: any): asserts json is ResErrors {
  if (!('error' in json)) {
    console.log(util.inspect(json, true, 100));
    throw new Error('Response is not an error');
  }
}

export function isValidationError(
  json: any
): asserts json is ResValidationError {
  if (!('error' in json) || json.error.code !== 'validation_error') {
    console.log(util.inspect(json, true, 100));
    throw new Error('Response is not a validation error');
  }
}

export function isSuccess<TType extends Record<any, any>>(
  json: TType
): asserts json is Exclude<TType, { error: any }> {
  if ('error' in json) {
    console.log(util.inspect(json, true, 100));
    throw new Error('Response is not a success');
  }
}

export class ApiClient {
  client: Client;

  constructor(port: number) {
    this.client = new Client(`http://localhost:${port}`, {
      keepAliveTimeout: 10,
      keepAliveMaxTimeout: 10,
    });
  }

  async get<TPath extends APIPaths>(
    path: GET<TPath> extends never ? never : TPath,
    token?: string,
    qp?: GET<TPath> extends never ? never : API[TPath]['GET']['qp']
  ): Promise<
    Dispatcher.ResponseData & {
      json: API[TPath] extends { GET: any } ? API[TPath]['GET']['res'] : never;
    }
  > {
    const res = await this.client.request({
      method: 'GET',
      path,
      query: qp || {},
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    const json = await res.body.json();
    return { json, ...res };
  }

  async post<TPath extends APIPaths>(
    path: POST<TPath> extends never ? never : TPath
  ): Promise<
    Dispatcher.ResponseData & {
      json: POST<TPath>['res'];
    }
  > {
    const res = await this.client.request({ method: 'POST', path });
    const json = await res.body.json();
    return { json, ...res };
  }

  async put<TPath extends APIPaths>(
    path: PUT<TPath> extends never ? never : TPath
  ): Promise<
    Dispatcher.ResponseData & {
      json: PUT<TPath>['res'];
    }
  > {
    const res = await this.client.request({ method: 'PUT', path });
    const json = await res.body.json();
    return { json, ...res };
  }

  async delete<TPath extends APIPaths>(
    // path: HasMethod<TPath, 'DELETE'>
    path: DELETE<TPath> extends never ? never : TPath
  ): Promise<
    Dispatcher.ResponseData & {
      json: DELETE<TPath>['res'];
    }
  > {
    const res = await this.client.request({ method: 'DELETE', path });
    const json = await res.body.json();
    return { json, ...res };
  }

  close() {
    this.client.close();
  }
}

// async function test() {
//   const cli = new ApiClient(300);

//   // Path should work
//   const res = await cli.get(`/0/documents/erz`);
//   res.json.data[0].name;

//   // Path should work
//   const res2 = await cli.get(`/0/revisions/ereori/checks`);
//   res2.json.data.canMerge;

//   // Path should work
//   const res3 = await cli.get(`/0/revisions/ereori`);
//   res3.json.data.blobs;

//   // Path should work
//   const res8 = await cli.put(`/0/revisions/ereori`);
//   res8.json;

//   // Path should fail
//   const res4 = await cli.post(`/0/revisions/ereori`);
//   // Data should fail
//   res4.json.data;

//   // Path should fail
//   const res5 = await cli.delete(`/0/orgs`);
//   // Data should fail
//   res5.json.data.authors;

//   // Path should fail
//   const res6 = await cli.get(`/0/ddfd`);
//   // Data should fail
//   res6.json.data;

//   // Edges cases sub path of revision
//   // Path should fail
//   const test = await cli.get(`/0/revisions/ereori/checkdfds`);
//   // Data should fail
//   test.json.data;

//   // Path should work
//   const res7 = await cli.delete(`/0/projects/d`);
//   res7.json.data;
// }
