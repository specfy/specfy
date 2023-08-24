import { envs } from '@specfy/core';
import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: envs.OPENAI_KEY || '',
});

export async function aiRewrite(text: string): Promise<{
  res: OpenAI.Chat.Completions.ChatCompletion;
  content: string;
  usage: OpenAI.CompletionUsage | undefined;
}> {
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
    model: 'gpt-3.5-turbo',
    max_tokens: 2000,
  });

  return {
    res,
    usage: res.usage,
    content: res.choices[0].message.content || '',
  };
}
