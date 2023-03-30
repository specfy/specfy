export async function fetchApi<
  T extends Record<string, any>,
  TQuery = undefined,
  TBody = undefined
>(
  path: string,
  opts?: (TBody extends Record<string, any>
    ? { body: TBody }
    : { body?: undefined }) &
    (TQuery extends Record<string, any> ? { qp: TQuery } : { qp?: undefined }),
  method?: RequestInit['method']
): Promise<{ res: Response; json: T }> {
  const url = new URL('http://localhost:3000/');
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
  });

  let json: T;
  if (res.status !== 204) {
    json = (await res.json()) as T;
  }

  return { res, json: json! || {} };
}
