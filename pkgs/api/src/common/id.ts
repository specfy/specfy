import { customAlphabet } from 'nanoid/non-secure';

export const alphabet =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export const size = 10;
export const nanoid = customAlphabet(alphabet, size);
