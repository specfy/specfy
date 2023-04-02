import { afterAll } from 'vitest';

afterAll(async () => {
  // await db.close();
  console.log('closed');
});
