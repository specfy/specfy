import { envs, l as logger } from '@specfy/core';
import type { FastifyReply } from 'fastify';
import OpenAI from 'openai';
import type { Stream } from 'openai/streaming';

export const openai = new OpenAI({
  apiKey: envs.OPENAI_KEY || '',
});

const l = logger.child({ svc: 'ai' });

export async function aiCompletion({
  orgId,
  messages,
}: {
  orgId: string;
  messages: OpenAI.Chat.Completions.CreateChatCompletionRequestMessage[];
}): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
  l.info({ orgId }, 'Completion start');
  const res = await openai.chat.completions.create({
    messages,
    stream: true,
    model: 'gpt-3.5-turbo',
    max_tokens: 2000,
    user: orgId,
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

  l.info('Completion done');

  res.raw.end();
}
