import { API_HOSTNAME } from '../common/envs';

export async function fetchApi<
  T extends {
    Body: Record<string, any> | never;
    Querystring: Record<string, any> | never;
    Reply: Record<string, any> | never;
  }
>(
  path: string,
  opts?: (T['Body'] extends never
    ? { body?: undefined }
    : { body: T['Body'] }) &
    (T['Querystring'] extends never
      ? { qp?: undefined }
      : { qp: T['Querystring'] }),
  method?: RequestInit['method']
): Promise<{ res: Response; json: T['Reply'] }> {
  const url = new URL(API_HOSTNAME);
  url.pathname = `/0${path}`;

  if (opts?.qp) {
    const qp = { ...opts.qp };
    for (const key in qp) {
      if (
        typeof qp[key] === 'undefined' ||
        (typeof qp[key] === 'string' && qp[key] === '')
      ) {
        delete qp[key];
      }
    }
    url.search = new URLSearchParams(qp).toString();
  }

  const headers: Record<string, string> = {};
  if (opts?.body) {
    headers['content-type'] = 'application/json';
  }

  const res = await fetch(url, {
    method: method || 'GET',
    body: opts?.body && JSON.stringify(opts.body),
    headers,
    credentials: 'include', // for cookies
  });

  let json: T;
  if (res.status !== 204) {
    json = (await res.json()) as T;
  }

  return { res, json: json || {} };
}
