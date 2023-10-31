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

export async function getCommitInfo(
  root: string,
  commit: string
): Promise<Commit | null> {
  const res = await execa(
    'git',
    ['log', '--pretty=format:%H%n%aN%n%aE%n%cd', '--date=iso', '-n1', commit],
    { cwd: root }
  );
  const lines = res.stdout.split('\n');
  if (lines.length != 4) {
    return null;
  }

  return {
    hash: lines[0],
    author: lines[1],
    email: lines[2],
    date: new Date(lines[3]),
  };
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
