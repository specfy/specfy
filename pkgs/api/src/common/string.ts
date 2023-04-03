import slugifyOrigin from 'slugify';

export const slugify = (str: string) =>
  slugifyOrigin(str, { lower: true, trim: true, strict: true });
