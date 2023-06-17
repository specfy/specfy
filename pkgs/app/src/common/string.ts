import slugifyOrigin from 'slugify';

export const slugify = (str: string) => {
  return slugifyOrigin(str, { lower: true, trim: true, strict: true });
};
