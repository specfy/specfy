import { truncate } from './seed/seed.js';

export async function setup() {
  console.log('on truncate');
  await truncate();
}
