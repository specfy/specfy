export const attrName = 'uid';
export const allowListFilename: Record<string, string> = {
  'CHANGELOG.md': 'Changelog',
  'README.md': 'Readme',
};
export const mapMarkType: Record<string, any> = {
  strong: 'bold',
  em: 'italic',
};
export const isLinkAbsolute = new RegExp('^(?:[a-z+]+:)?//', 'i');
export const mdExtension = /.md$/;
