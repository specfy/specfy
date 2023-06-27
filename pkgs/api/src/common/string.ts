import slugifyOrigin from 'slugify';

export const slugify = (str: string) => {
  return slugifyOrigin(str, { lower: true, trim: true, strict: true });
};

export function titleCase(str: string): string {
  const splitStr = str.split(' ');
  for (let i = 0; i < splitStr.length; i++) {
    // You do not need to check if i is larger than splitStr length, as your for does that for you
    // Assign it back to the array
    splitStr[i] =
      splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
  }
  // Directly return the joined string
  return splitStr.join(' ');
}
