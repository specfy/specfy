import { envs, l } from '@specfy/core';
import type { FastifyReply } from 'fastify';
import OpenAI from 'openai';
import type { Stream } from 'openai/streaming';

export const openai = new OpenAI({
  apiKey: envs.OPENAI_KEY || '',
});

export async function aiRewrite(
  text: string
): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
  l.info('Generating a rewrite');
  const res = await openai.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You rewrite content you are provided with for a professional american technical engineer. Do not use adverb or subjective language.',
      },
      {
        role: 'user',
        content: text,
      },
    ],
    stream: true,
    model: 'gpt-3.5-turbo',
    max_tokens: 2000,
  });

  return res;
}

export async function aiStream(
  res: FastifyReply,
  completion: Stream<OpenAI.Chat.Completions.ChatCompletionChunk>
) {
  res.raw.writeHead(200, {
    ...res.getHeaders(),
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  });

  for await (const part of completion) {
    const content = part.choices[0].delta.content || '';

    if (content) {
      res.raw.write(`data: ${JSON.stringify({ content })}`);
      res.raw.write('\n\n');
    }
  }

  l.info('Rewrite done');

  res.raw.end();
}
