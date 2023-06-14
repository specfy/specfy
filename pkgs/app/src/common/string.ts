import slugifyOrigin from 'slugify';
import stringHash from 'string-hash';

export const slugify = (str: string) =>
  slugifyOrigin(str, { lower: true, trim: true, strict: true });

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

function stringToHslColor(str: string, sat: number = 22, lum: number = 91) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const h = hash % 360;
  return 'hsl(' + h + ', ' + sat + '%, ' + lum + '%)';
}

const paletteBg = [
  // -- 300
  // '#fecaca',
  // '#fed7aa',
  // '#fef08a',
  // '#bef264',
  // '#86efac',
  // '#6ee7b7',
  // '#5eead4',
  // '#67e8f9',
  // '#7dd3fc',
  // '#93c5fd',
  // '#a5b4fc',
  // '#d8b4fe',
  // '#f0abfc',
  // '#f9a8d4',
  // '#fda4af',

  // -- 200
  '#fecaca',
  '#fed7aa',
  '#fde68a',
  '#fef08a',
  '#d9f99d',
  '#bbf7d0',
  '#a7f3d0',
  '#99f6e4',
  '#a5f3fc',
  '#bae6fd',
  '#bfdbfe',
  '#c7d2fe',
  '#ddd6fe',
  '#e9d5ff',
  '#f5d0fe',
  '#fbcfe8',
  '#fecdd3',
];
const paletteColor = [
  // -- 300
  // '#dc2626',
  // '#ea580c',
  // '#ca8a04',
  // '#65a30d',
  // '#16a34a',
  // '#059669',
  // '#0d9488',
  // '#0891b2',
  // '#0284c7',
  // '#2563eb',
  // '#4f46e5',
  // '#9333ea',
  // '#c026d3',
  // '#db2777',
  // '#e11d48',

  // -- 200
  '#dc2626',
  '#ea580c',
  '#d97706',
  '#ca8a04',
  '#65a30d',
  '#16a34a',
  '#059669',
  '#0d9488',
  '#0891b2',
  '#0284c7',
  '#2563eb',
  '#4f46e5',
  '#7c3aed',
  '#9333ea',
  '#c026d3',
  '#db2777',
  '#e11d48',
];

export function stringToColor(str: string): {
  backgroundColor: string;
  color: string;
} {
  // eslint-disable-next-line no-constant-condition
  if (true === true) {
    return {
      backgroundColor: stringToHslColor(str, 95, 85),
      color: stringToHslColor(str, 80, 40),
    };
  }

  const hashedText = stringHash(str);
  const colorIndex = hashedText % paletteColor.length;

  return {
    backgroundColor: paletteBg[colorIndex],
    color: paletteColor[colorIndex],
  };
}
