import { createPatch, diffChars } from 'diff';
import { diff_match_patch } from 'diff-match-patch';
import jsonDiff from 'json-diff';
import { parseDiff } from 'react-diff-view';

import type {
  BlockHardBreak,
  BlockLevelZero,
  Blocks,
  BlocksOfText,
  BlocksWithContent,
  BlocksWithText,
  BlockText,
  MarkDiff,
  Marks,
} from '@specfy/models';

import { getEmptyDoc } from '../content';

import type { Mark } from '@tiptap/pm/model';
import type { Schema } from 'prosemirror-model';

// Inspired from
// https://github.com/hamflx/prosemirror-diff/blob/master/src/DiffType.js

interface FindTextNode {
  node: BlockHardBreak | BlockText;
  from: number;
  to: number;
}

const TYPE_TO_MARK: Record<string, string> = {
  '1': 'added',
  '-1': 'removed',
};

interface PatchText {
  type: number;
  text: string;
  oldFrom: number;
  oldTo: number;
  newFrom: number;
  newTo: number;
}

// ----- Helpers
function isTextNode(node?: Blocks): node is BlockText {
  return node?.type === 'text';
}

function hasTextNodes(node: Blocks): node is BlocksWithText {
  return (
    node.type === 'paragraph' ||
    node.type === 'heading' ||
    node.type === 'codeBlock'
  );
}

function getText(node: BlockHardBreak | BlockText): string {
  if (node.type === 'hardBreak') {
    return '\n';
  }
  return node.text;
}

function getTexts(node: BlocksWithText): string {
  return node.content?.map(getText).join('') || '';
}

function getMarks(nodes: FindTextNode[]): Marks[] {
  const map = new Map<string, Marks>();
  for (const item of nodes) {
    if (item.node.marks && item.node.marks.length > 0) {
      for (const mark of item.node.marks) {
        map.set(mark.type, mark);
      }
    }
  }

  return Array.from(map.values());
}

function diffMarks(oldMarks: Marks[], newMarks: Marks[]) {
  oldMarks.sort((a, b) => (a.type < b.type ? -1 : 1));
  newMarks.sort((a, b) => (a.type < b.type ? -1 : 1));
  const diff = diffChars(JSON.stringify(newMarks), JSON.stringify(oldMarks));
  // console.log('marks', { newMarks: newMarks, oldMarks, diffMark });
  return diff.length > 1;
}

/**
 * This method get all nodes text inside a range.
 */
export function findTextNodes(
  nodes: BlocksWithText,
  from: number,
  to: number
): FindTextNode[] {
  const result: FindTextNode[] = [];
  let start = 0;

  for (let i = 0; i < nodes.content!.length && start < to; i++) {
    const node = nodes.content![i];
    const text = node.type === 'hardBreak' ? '\n' : node.text;
    const end = start + text.length;
    const intersect =
      (start >= from && start < to) ||
      (end > from && end <= to) ||
      (start <= from && end >= to);
    if (intersect) {
      result.push({ node, from: start, to: end });
    }
    start += text.length;
  }

  return result;
}

/**
 * This method take a new text and mark, and apply old marks on top of it.
 */
function applyTextNodeAttrsMarks(
  _schema: Schema,
  text: string,
  mark: Mark | null,
  base: number,
  textItems: FindTextNode[],
  oldNode?: BlocksWithText
): BlocksOfText[] {
  if (textItems.length <= 0) {
    return [];
  }

  const baseMarks: MarkDiff[] = mark ? [mark.toJSON()] : [];
  const firstItem = textItems[0];
  const nodeEnd = base + text.length;
  const result: BlocksOfText[] = [];

  if (firstItem.from - base > 0) {
    result.push({
      type: 'text',
      text: text.slice(0, firstItem.from - base),
      marks: baseMarks,
    });
  }

  for (let i = 0; i < textItems.length; i++) {
    const { from, node: textNode, to } = textItems[i];
    const oldTexts =
      baseMarks.length <= 0 && oldNode
        ? findTextNodes(oldNode, from, to)
        : null;
    const newText = text.slice(Math.max(from, base) - base, to - base);

    if (textNode.type === 'hardBreak') {
      result.push({
        type: 'hardBreak',
        marks: baseMarks,
      });
    } else {
      // Diff old marks to find formatting change
      if (oldTexts) {
        const oldMarks = getMarks(oldTexts);
        if (diffMarks(oldMarks, textNode.marks || [])) {
          if (!textNode.marks) textNode.marks = [];
          // We want the mark to be first in array
          textNode.marks.unshift({
            type: 'diffMark',
            attrs: { type: 'formatting' },
          });
        }
      }

      result.push({
        type: 'text',
        text: newText,
        marks:
          baseMarks.length || textNode.marks?.length
            ? [...baseMarks, ...(textNode.marks || [])]
            : undefined,
      });
    }

    // move cursor
    const nextFrom = i + 1 < textItems.length ? textItems[i + 1].from : nodeEnd;

    if (nextFrom > to) {
      result.push({
        type: 'text',
        text: text.slice(to - base, nextFrom - base),
        marks: baseMarks,
      });
    }
  }

  return result;
}

// ---- Differ
/**
 * This will patch text node inside Paragraph and Headings.
 * - We first do a raw text diff to find deleted/added text
 * - Then we recreate nodes based on length to keep the marks alive
 */
function patchTexts(
  schema: Schema,
  oldNode: BlocksWithText,
  newNode: BlocksWithText
): BlocksOfText[] {
  const dmp = new diff_match_patch();
  const oldText = getTexts(oldNode);
  const newText = getTexts(newNode);
  const diffs = dmp.diff_main(oldText, newText);
  let oldLen = 0;
  let newLen = 0;

  // This will group by words instead of matching by char
  dmp.diff_cleanupSemantic(diffs);

  // console.log('after', diffs);

  const patches: PatchText[] = [];
  const nodes: BlocksOfText[] = [];

  // Create new nodes based on diff
  for (const diff of diffs) {
    const type = diff[0];
    const text = diff[1];

    const oldFrom = oldLen;
    const oldTo = oldFrom + (type === 1 ? 0 : text.length);
    const newFrom = newLen;
    const newTo = newFrom + (type === -1 ? 0 : text.length);
    oldLen = oldTo;
    newLen = newTo;

    patches.push({ type, text, oldFrom, oldTo, newFrom, newTo });
  }

  // Apply old marks on new nodes
  for (const patch of patches) {
    const mark =
      patch.type !== 0
        ? schema.mark('diffMark', { type: TYPE_TO_MARK[`${patch.type}`] })
        : null;

    if (patch.type === -1) {
      // Deleted
      const textItems = findTextNodes(oldNode, patch.oldFrom, patch.oldTo);
      const node = applyTextNodeAttrsMarks(
        schema,
        patch.text,
        mark,
        patch.oldFrom,
        textItems
      );
      if (node) {
        nodes.push(...node);
      }

      continue;
    }

    // Added or Unchanged
    const textItems = findTextNodes(newNode, patch.newFrom, patch.newTo);
    const node = applyTextNodeAttrsMarks(
      schema,
      patch.text,
      mark,
      patch.newFrom,
      textItems,
      oldNode
    );
    if (node) {
      nodes.push(...node);
    }
  }

  // console.log(nodes);
  return nodes;
}

function patchDocument(
  schema: Schema,
  refOldDoc: BlockLevelZero | BlocksWithContent,
  refNewDoc: BlockLevelZero | BlocksWithContent
): BlockLevelZero {
  // Because we shift the arrays we copy to avoid modifying the original
  // Plus it breaks in recursive mode
  const oldDoc = JSON.parse(JSON.stringify(refOldDoc));
  const newDoc = JSON.parse(JSON.stringify(refNewDoc));

  const doc = getEmptyDoc();
  const idsLeft = new Map<string, number>();
  const idsRight = new Map<string, number>();

  if (oldDoc.content) {
    for (let index = 0; index < oldDoc.content.length; index++) {
      const node = oldDoc.content[index];
      if (!isTextNode(node)) {
        idsLeft.set(node.attrs.uid, index);
      }
    }
  }
  if (newDoc.content) {
    for (let index = 0; index < newDoc.content.length; index++) {
      const node = newDoc.content[index];
      if (!isTextNode(node)) {
        idsRight.set(node.attrs.uid, index);
      }
    }
  }

  const iLeft = 0;
  const iRight = 0;

  /**
   * This loop will pop "left - right" at the same time
   * On each loop we check from left to right if:
   * - it wasn't deleted
   * - it wasn't modified
   *
   * then right to left if:
   * - it's a new entry
   *
   * We use "attrs.uid" to easily find items otherwise it would be very complicated to find difference
   * We push everything into a new document
   * Add a key "diff" that can be used for rendering
   * Add a marks "diff" that can be used for rendering
   */
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const popLeft = oldDoc.content?.[iLeft];
    const popRight = newDoc.content?.[iRight];
    const isTextLeft = isTextNode(popLeft);
    const isTextRight = isTextNode(popRight);
    let typeLeft: 'added' | 'moved' | 'removed' | 'unchanged' | null = null;
    let typeRight:
      | 'added'
      | 'modified'
      | 'moved'
      | 'removed'
      | 'unchanged'
      | null = null;

    // Check left item
    if (popLeft) {
      if (isTextLeft) {
        typeLeft = 'unchanged';
      } else {
        const has = idsRight.get(popLeft.attrs.uid);
        if (typeof has === 'undefined') {
          typeLeft = 'removed';
        } else if (
          popRight &&
          !isTextRight &&
          popLeft.attrs.uid === popRight.attrs.uid
        ) {
          typeLeft = 'unchanged';
        } else {
          typeLeft = 'moved';
        }
      }
    }

    // Check right item
    if (popRight) {
      if (isTextRight) {
        typeLeft = 'unchanged';
      } else {
        const has = idsLeft.get(popRight.attrs.uid);
        if (typeof has === 'undefined') {
          typeRight = 'added';
        } else if (
          popLeft &&
          !isTextLeft &&
          popLeft.attrs.uid === popRight.attrs.uid
        ) {
          // Diff attributes
          const diffAttrs = jsonDiff.diff(popLeft.attrs, popRight.attrs);
          if (diffAttrs) {
            typeRight = 'modified';
          } else {
            typeRight = 'unchanged';
          }

          if (hasTextNodes(popLeft) && hasTextNodes(popRight)) {
            if (popLeft.type === 'codeBlock' && popRight.type === 'codeBlock') {
              const patchArray = createPatch(
                'code',
                getTexts(popLeft),
                getTexts(popRight),
                undefined,
                undefined,
                { context: 200 }
              ).split('\n');
              if (patchArray.length > 5) {
                patchArray.splice(0, 2);
                const patch = patchArray.join('\n');
                popRight.codeDiff = parseDiff(patch, {
                  nearbySequences: 'zip',
                })[0];
              }
            } else {
              // Diff text nodes
              const nodes = patchTexts(schema, popLeft, popRight);
              if (nodes.length) {
                popRight.content = nodes as unknown as BlockText[];
              }
            }
          } else if ('content' in popRight && 'content' in popLeft) {
            // Recursively diff inner blocks
            const patched = patchDocument(schema, popLeft, popRight);
            popRight.content = patched.content;
          }
        } else {
          typeRight = 'moved';
        }
      }
    }

    if (!popLeft && !popRight) {
      break;
    }

    // console.log({ typeLeft, typeRight, popLeft, popRight });

    if (typeLeft === 'unchanged' && typeRight === 'unchanged') {
      oldDoc.content!.shift();
      const node = newDoc.content!.shift();
      doc.content.push({
        ...node,
        marks: [{ type: 'diffMark', attrs: { type: 'unchanged' } }],
      });

      continue;
    }
    if (!typeLeft && typeRight === 'moved') {
      const node = newDoc.content!.shift();
      doc.content.push({
        ...node,
        marks: [{ type: 'diffMark', attrs: { type: 'added' } }],
      });

      continue;
    }

    if (typeRight === 'modified') {
      const oldNode = oldDoc.content!.shift();
      const newNode = newDoc.content!.shift();

      doc.content.push({
        ...oldNode,
        marks: [{ type: 'diffMark', attrs: { type: 'removed' } }],
      });
      doc.content.push({
        ...newNode,
        marks: [{ type: 'diffMark', attrs: { type: 'added' } }],
      });
      continue;
    }

    if (typeRight === 'added') {
      const node = newDoc.content!.shift();
      doc.content.push({
        ...node,
        marks: [{ type: 'diffMark', attrs: { type: 'added' } }],
      });
      continue;
    }

    if (typeLeft === 'removed' || typeLeft === 'moved') {
      const node = oldDoc.content!.shift();
      doc.content.push({
        ...node,
        marks: [{ type: 'diffMark', attrs: { type: 'removed' } }],
      });
      continue;
    }

    // Something is very wrong
    console.error('leftOver', { typeLeft, typeRight, popLeft, popRight });
    break;
  }

  return doc;
}

export function diffEditor(
  schema: Schema,
  oldDoc: BlockLevelZero,
  newDoc: BlockLevelZero
): BlockLevelZero {
  // console.log(oldDoc, newDoc);
  return patchDocument(schema, oldDoc, newDoc);
}
