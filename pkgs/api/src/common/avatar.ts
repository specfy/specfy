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
    return firstLetters.slice(0, 2).toUpperCase();
  }

  // Rollback to something generic if nothing is left
  return name
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 2)
    .toUpperCase();
}

const palette = [
  'ea9280',
  'e58fb1',
  'e38ec3',
  'be93e4',
  '8da4ef',
  '5eb0ef',
  '40c4aa',
  '3db9cf',
  '5bb98c',
  '94ba2c',
  'ebbc00',
  'fa934e',
  'd09e72',
];

export function stringToColor(str: string): {
  backgroundColor: string;
  color: string;
} {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colorIndex = Math.abs(hash % palette.length);
  return {
    backgroundColor: `#${palette[colorIndex]}`,
    color: `white`,
  };
}
