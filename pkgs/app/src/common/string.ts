import { presetPalettes } from '@ant-design/colors';
import stringHash from 'string-hash';

export function slugify(title: string): string {
  return title.replace(/[^a-zA-Z]/g, '').toLocaleLowerCase();
}

export function acronymize(name: string): string {
  const clean = name
    // remove all tag-like sequences: [Shared][Prod]
    .replace(/\[[^\]]*\]/g, '')
    // remove noisy chars with spaces
    .replace(/[/._&:-]/g, ' ')
    // remove ad-hoc key words
    .replace(/(https?|www|test|dev|(pre)?prod(uction| |$)|demo|poc|wip)/gi, '');

  const firstLetters = clean.match(/\b(\w)/g)?.join('');
  if (firstLetters && firstLetters.length > 1) {
    return firstLetters!.slice(0, 2).toUpperCase();
  }

  // Rollback to something generic if nothing is left
  return name
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 2)
    .toUpperCase();
}

// https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
export function stringToColorRandom(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return `hsl(${hash % 250}, 85%, 80%)`;
}

const palette = Object.entries(presetPalettes);
palette.pop();
export function stringToColor(str: string): {
  backgroundColor: string;
  color: string;
} {
  const hashedText = stringHash(str);
  const colorIndex = hashedText % palette.length;

  return {
    backgroundColor: palette[colorIndex][1][2],
    color: palette[colorIndex][1][0],
  };
}
