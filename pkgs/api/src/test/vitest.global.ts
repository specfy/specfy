import { truncate } from './seed/seed';

export async function setup() {
  await truncate();
}
