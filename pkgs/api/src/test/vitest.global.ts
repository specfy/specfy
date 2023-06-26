import { truncate } from './seed/seed.js';

export async function setup() {
  await truncate();
}
