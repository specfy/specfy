export async function fetchApi<T>(
  path: string,
  opts?: { qp?: Record<string, any>; body?: any },
  method?: RequestInit['method']
) {
  const url = new URL('http://localhost:3000/');
  url.pathname = `/0${path}`;

  if (opts?.qp) {
    url.search = new URLSearchParams(opts.qp).toString();
  }

  const res = await fetch(url, {
    method: method || 'GET',
    body: opts?.body && JSON.stringify(opts.body),
    headers: {
      'content-type': 'application/json',
    },
  });
  const json = (await res.json()) as T;

  return { res, json };
}
