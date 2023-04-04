import util from 'node:util';

import type { Dispatcher } from 'undici';
import { Client } from 'undici';
import type { OmitByValue } from 'utility-types';

import type { ResErrors, ResValidationError } from '../types/api';
import type { API, APIPaths } from '../types/api/endpoints';
import type { FilterObjObjWithKey } from '../types/utils';

type HasGet = { GET: any };
type HasPost = { POST: any };
type HasPut = { PUT: any };
type HasPatch = { PATCH: any };
type HasDelete = { DELETE: any };

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
  if (json && 'error' in json) {
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
    // path: GET<TPath> extends never ? never : TPath,
    path: TPath extends keyof FilterObjObjWithKey<API, 'GET'>
      ? TPath
      : keyof FilterObjObjWithKey<API, 'GET'>,
    // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
    opts?: {
      token?: string;
    } & (API[TPath] extends HasGet
      ? OmitByValue<Omit<API[TPath]['GET'], 'res'>, never>
      : never)
  ): Promise<
    Dispatcher.ResponseData & {
      json: API[TPath] extends HasGet ? API[TPath]['GET']['res'] : never;
    }
  > {
    return await this.query('GET', path, opts);
  }

  async post<TPath extends APIPaths>(
    path: TPath extends keyof FilterObjObjWithKey<API, 'POST'>
      ? TPath
      : keyof FilterObjObjWithKey<API, 'POST'>,
    // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
    opts?: {
      token?: string;
    } & (API[TPath] extends HasPost
      ? OmitByValue<Omit<API[TPath]['POST'], 'res'>, never>
      : never)
  ): Promise<
    Dispatcher.ResponseData & {
      json: API[TPath] extends HasPost ? API[TPath]['POST']['res'] : never;
    }
  > {
    return await this.query('POST', path, opts);
  }

  async put<TPath extends APIPaths>(
    path: TPath extends keyof FilterObjObjWithKey<API, 'PUT'>
      ? TPath
      : keyof FilterObjObjWithKey<API, 'PUT'>,
    // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
    opts?: {
      token?: string;
    } & (API[TPath] extends HasPut
      ? OmitByValue<Omit<API[TPath]['PUT'], 'res'>, never>
      : never)
  ): Promise<
    Dispatcher.ResponseData & {
      json: API[TPath] extends HasPut ? API[TPath]['PUT']['res'] : never;
    }
  > {
    return await this.query('PUT', path, opts);
  }

  async patch<TPath extends APIPaths>(
    path: TPath extends keyof FilterObjObjWithKey<API, 'PATCH'>
      ? TPath
      : keyof FilterObjObjWithKey<API, 'PATCH'>,
    // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
    opts?: {
      token?: string;
    } & (API[TPath] extends HasPatch
      ? OmitByValue<Omit<API[TPath]['PATCH'], 'res'>, never>
      : never)
  ): Promise<
    Dispatcher.ResponseData & {
      json: API[TPath] extends HasPatch ? API[TPath]['PATCH']['res'] : never;
    }
  > {
    return await this.query('PATCH', path, opts);
  }

  async delete<TPath extends APIPaths>(
    path: TPath extends keyof FilterObjObjWithKey<API, 'DELETE'>
      ? TPath
      : keyof FilterObjObjWithKey<API, 'DELETE'>,
    // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
    opts?: {
      token?: string;
    } & (API[TPath] extends HasDelete
      ? OmitByValue<Omit<API[TPath]['DELETE'], 'res'>, never>
      : never)
  ): Promise<
    Dispatcher.ResponseData & {
      json: API[TPath] extends HasDelete ? API[TPath]['DELETE']['res'] : never;
    }
  > {
    return await this.query('DELETE', path, opts);
  }

  async close() {
    await this.client.close();
  }

  private async query(
    method: Dispatcher.HttpMethod,
    path: string,
    opts?: {
      token?: string;
      qp?: Record<string, any>;
      body?: Record<string, any>;
    }
  ) {
    const res = await this.client.request({
      method,
      path,
      query: opts && 'qp' in opts ? opts.qp : {},
      body: opts && 'body' in opts ? JSON.stringify(opts.body) : null,
      headers: {
        authorization: `Bearer ${opts?.token}`,
        ...(opts && 'body' in opts
          ? { 'content-type': 'application/json' }
          : {}),
      },
    });

    let json: any = null;
    if (res.statusCode !== 204) {
      json = await res.body.json();
    }

    return { json, ...res };
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
