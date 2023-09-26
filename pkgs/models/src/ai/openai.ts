import { envs, l as logger } from '@specfy/core';
import OpenAI from 'openai';

import type { FastifyReply } from 'fastify';
import type { Stream } from 'openai/streaming';

export const openai = new OpenAI({
  apiKey: envs.OPENAI_KEY || '',
});

const l = logger.child({ svc: 'ai' });

export async function aiCompletion({
  orgId,
  messages,
  maxTokens = 2000,
}: {
  orgId: string;
  messages: OpenAI.Chat.Completions.CreateChatCompletionRequestMessage[];
  maxTokens?: number;
}): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk>> {
  l.info({ orgId }, 'Completion start');
  const res = await openai.chat.completions.create({
    messages,
    stream: true,
    model: 'gpt-3.5-turbo',
    max_tokens: maxTokens,
    user: orgId,
    temperature: 0.4,
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
