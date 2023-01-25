export async function fetchApi<T>(
  path: string,
  opts?: { qp?: Record<string, any>; body?: any }
) {
  const url = new URL('http://localhost:3000/');
  url.pathname = `/0${path}`;

  if (opts?.qp) {
    url.search = new URLSearchParams(opts.qp).toString();
  }

  const res = await fetch(url);
  const json = (await res.json()) as T;

  return { res, json };
}
