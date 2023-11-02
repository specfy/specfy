import path from 'node:path';

import { tech } from '@specfy/stack-analyser';
import { execa } from 'execa';

import type { Commit, CommitAnalysis } from '@specfy/models';

export async function listHashes(
  root: string,
  count: number
): Promise<string[]> {
  const res = await execa(
    'git',
    ['log', '--pretty=format:%H', '--no-patch', `-n${count}`],
    { cwd: root }
  );

  return res.stdout.split('\n');
}

export async function getCommitFileList(
  root: string,
  commit: string
): Promise<string[]> {
  const res = await execa(
    'git',
    ['diff-tree', '--no-commit-id', '--name-only', '-r', commit],
    { cwd: root }
  );

  return res.stdout.split('\n');
}

export function formatCommitInfo(lines: string[]) {
  if (lines.length < 4) {
    return null;
  }

  const regLabel = /^(name|email|date|hash|Co-authored-by): (.*)/;
  const regAuthor = /^(.+) <(.*)>/;
  const author: Commit['authors'][0] = { email: '', name: '' };
  const ret: Commit = {
    hash: '',
    date: new Date(),
    authors: [author],
  };

  for (const line of lines) {
    const match = line.match(regLabel);
    if (!match || match.length !== 3) {
      continue;
    }

    const key = match[1];
    switch (key) {
      case 'hash':
        ret[key] = match[2];
        break;
      case 'date':
        ret[key] = new Date(match[2]);
        break;
      case 'name':
        author.name = match[2];
        break;
      case 'email':
        author.email = match[2];
        break;
      case 'Co-authored-by': {
        const authorMatched = match[2].match(regAuthor);
        if (!authorMatched || authorMatched.length !== 3) {
          continue;
        }

        ret.authors.push({
          name: authorMatched[1],
          email: authorMatched[2],
        });
        break;
      }
    }
  }

  return ret;
}

export async function getCommitInfo(
  root: string,
  commit: string
): Promise<Commit | null> {
  const res = await execa(
    'git',
    [
      'log',
      '--pretty=format:hash: %H%nname: %aN%nemail: %aE%ndate: %cd%n%(trailers:key=Co-authored-by)',
      '--date=iso',
      '-n1',
      commit,
    ],
    { cwd: root }
  );
  const lines = res.stdout.split('\n');

  return formatCommitInfo(lines);
}

export function getTechFromFileList(files: string[]): Set<string> {
  const tmp = tech.detectInFileList(
    files.map((file) => {
      return { fp: file, name: path.basename(file), type: 'file' };
    }),
    '/'
  );

  return new Set(tmp.keys());
}

export async function analyzeCommit({
  root,
  commit = 'HEAD',
}: {
  root: string;
  commit?: string;
}): Promise<CommitAnalysis | null> {
  const info = await getCommitInfo(root, commit);
  const files = await getCommitFileList(root, commit);

  if (!files || !info) {
    return null;
  }

  const techs = getTechFromFileList(files);

  return { info, techs: Array.from(techs.values()) };
}
