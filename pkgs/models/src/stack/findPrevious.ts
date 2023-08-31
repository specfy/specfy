import type { Components } from '@specfy/db';
import type { AnalyserJson } from '@specfy/stack-analyser';

export interface PropsFindPrevious {
  child: AnalyserJson;
  prevs: Components[];
  source: string;
  prevIdUsed: string[];
}

/**
 * When we receive a stack Payload, each component have id, name, tech and sourcePath
 * that we can use to differentiate and potentially find the component already in DB that matches.
 * In most case the naive triple check is enough. But in some cases sourcePath check is mandatory.
 * e.g:
 *  two components named API with tech null in a different place
 *
 * - We can't use a perfect hash because any sourcePath change would break the "mv" scenario.
 * - The rename scenario is the most probable however it's very hard to differentiate a rename from a delete + new
 */

/**
 * 1.
 * The first -- brute force -- solution is to find a perfect perfect match.
 * It's very unlikely that a different component comes with the same name, same path and same tech.
 * And if it happens we would have no way to differentiate them anyway so we can reuse the component.
 */
export function findPerfectMatch({
  child,
  prevs,
  source,
}: Omit<PropsFindPrevious, 'prevIdUsed'>): Components | null {
  // Naive match that should fit 99% use case = nothing has changed
  // We don't check the path yet because it can be a mv case if there is only one match
  for (const prev of prevs) {
    if (
      prev.sourceName === child.name &&
      prev.techId === child.tech &&
      prev.source === source &&
      prev.sourcePath?.length === child.path.length &&
      prev.sourcePath.filter((pa) => child.path.includes(pa)).length ===
        prev.sourcePath.length
    ) {
      return prev;
    }
  }

  return null;
}

/**
 * 2.
 * The second solution is to progressively relax the filtering.
 * We have removed all the perfect match from the pool, so it only leave new component or rename.
 *
 * Rename can be found if the "name" has changed or if sourcePath has changed but the not the name.
 *
 * ///!\\\ One scenario not handled:
 * Two components are renamed at the same time and their order are also switched
 * e.g:
 *  - a -> z, y -> b
 *  - a -> z, z -> a
 *
 * In that case we will re-use the wrong component.
 */
export function findPrevious(props: PropsFindPrevious): Components | null {
  const exact = findExactNameMatch(props);
  if (exact) {
    if (exact?.length === 1) {
      return exact[0];
    }

    const byPath = refineByPath(props, exact);
    if (byPath?.length === 1) {
      return byPath[0];
    }
  }

  return findRename(props);
}

function findExactNameMatch({
  child,
  prevs,
  source,
  prevIdUsed,
}: PropsFindPrevious): Components[] | null {
  const matches = [];
  // Naive match that should fit 99% use case = nothing has changed
  // We don't check the path yet because it can be a mv case if there is only one match
  for (const prev of prevs) {
    if (
      prev.sourceName === child.name &&
      prev.techId === child.tech &&
      prev.source === source &&
      !prevIdUsed.includes(prev.id)
    ) {
      matches.push(prev);
    }
  }

  return matches;
}

function findRename({
  child,
  prevs,
  source,
  prevIdUsed,
}: PropsFindPrevious): Components | null {
  const matches = [];
  for (const prev of prevs) {
    if (
      prev.techId === child.tech &&
      prev.source === source &&
      !prevIdUsed.includes(prev.id)
    ) {
      matches.push(prev);
    }
  }
  const byPath = refineByPath({ child, prevs, source, prevIdUsed }, matches);
  if (byPath?.length === 1) {
    return byPath[0];
  }

  return null;
}

function refineByPath(
  { child }: PropsFindPrevious,
  filtered: Components[]
): Components[] | null {
  const matches = [];
  for (const match of filtered) {
    if (!match.sourcePath) {
      // This would be weird but TS pleasing
      continue;
    }

    for (const path of match.sourcePath) {
      if (child.path.includes(path)) {
        // We matched a path, there is 99.99% chance we found the right one
        // There is still a chance multiple would have match
        matches.push(match);
      }
    }
  }

  return matches;
}
