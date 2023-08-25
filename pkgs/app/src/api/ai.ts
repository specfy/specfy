import type { PostAiOperation } from '@specfy/models';

import { API_HOSTNAME } from '../common/envs';

export async function aiOperation(
  body: PostAiOperation['Body']
): Promise<Response> {
  const res = await fetch(new URL(`${API_HOSTNAME}/0/ai`), {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      ['content-type']: 'application/json',
    },
    credentials: 'include', // for cookies
  });

  return res;
}

/**
 * Stream answer from backend.
 *
 * Inspiration:
 * https://github.com/vriteio/vrite/blob/469651ee61ee057e72cb32ccf93eeaf4bd527a76/packages/extensions/src/gpt-3.5/functions/generate.ts
 * https://medium.com/@mohdejazsiddiqui/how-to-stream-openai-completion-model-response-to-client-in-nextjs-2206d3c48c1b
 *
 */
export async function aiStream({
  res,
  onAppend,
  onFinish,
}: {
  res: Response;
  onAppend: (chunk: string) => void;
  onFinish: () => void;
}) {
  if (!res.ok || !res.body) {
    return;
  }

  const reader = res.body.getReader();

  const processStream = async () => {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        console.debug('AI stream completed');
        onFinish();
        break;
      }

      const chunk = new TextDecoder('utf-8').decode(value);

      /**
       * we split the 'data: ' from the chunk, it can appears multiple times
       * e.g:
       *
       * data: '{"content": "Specfy"}\n\n'
       * data: '{"content": " is fantastic"}\n\n'
       * data: '{"content": "."}\n\n'
       */
      const lines = chunk.split(/^data: /gm);
      for (const line of lines) {
        if (line === '' || !line.startsWith('{')) {
          continue;
        }

        const parsed = JSON.parse(line);
        onAppend(parsed.content);
      }
    }
  };

  processStream().catch((err) => {
    console.error('AI Stream Error', err);
  });
}
