export interface ProviderFile {
  name: string;
  type: 'dir' | 'file';
  fp: string;
}

export interface BaseProvider {
  basePath: string;
  listDir: (pathRelative: string) => Promise<ProviderFile[]>;
  open: (path: string) => Promise<string>;
}

export const IGNORED_DIVE_PATHS = [
  'node_modules',
  'dist',
  'build',
  'bin',
  'static',
  'public',
  'vendor',
  'migrations',
  'terraform.tfstate.d',
  'tests',
  '__fixtures__',
  '__snapshots__',
  'tmp',
];

export const IGNORED_DIVE_REGEX = [
  // Folder starting with a dot
  /^\./,
];

export const IGNORED_FILENAME_REGEX = [
  // Markdown starting with an underscore are often sign of an included file (e.g: sidebar, menu, metadata, etc.)
  /^_.md$/,
];
