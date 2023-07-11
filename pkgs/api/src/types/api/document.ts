import type { FileData } from 'react-diff-view';

import type { ApiDocument } from './documents.js';

export interface BlockDefaultAttrs {
  uid: string;
}
export interface MarkDiff {
  type: 'diffMark';
  attrs: { type: 'added' | 'formatting' | 'removed' | 'unchanged' };
}
export type Marks =
  | MarkDiff
  | {
      type: 'link';
      attrs: {
        href: string;
        target: string;
        class?: string | null | undefined;
      };
    }
  | { type: 'bold' }
  | { type: 'code' }
  | { type: 'italic' };

// ----- Text
export interface BlockText {
  type: 'text';
  text: string;
  marks?: Marks[] | undefined;
}

/**
 * @toExtract
 */
export interface BlockParagraph {
  type: 'paragraph';
  content?: Array<BlockHardBreak | BlockText> | undefined;
  attrs: BlockDefaultAttrs;
  marks?: MarkDiff[];
}
export interface BlockHardBreak {
  type: 'hardBreak';
  content?: undefined;
  marks?: MarkDiff[] | undefined;
}

// ----- Headings
export interface BlockHeading {
  type: 'heading';
  content?: BlockText[] | undefined;
  attrs: BlockDefaultAttrs & { level: number };
  marks?: MarkDiff[];
}

// ----- Bullet List
export interface BlockListItem {
  type: 'listItem';
  content: BlockParagraph[];
  attrs: BlockDefaultAttrs;
  marks?: MarkDiff[];
}
export interface BlockBulletList {
  type: 'bulletList';
  content: BlockListItem[];
  attrs: BlockDefaultAttrs;
  marks?: MarkDiff[];
}

// ----- Ordered List
export interface BlockOrderedList {
  type: 'orderedList';
  content: BlockParagraph[];
  attrs: BlockDefaultAttrs;
  marks?: MarkDiff[];
}

// ----- Task List
export interface BlockTaskItem {
  type: 'taskItem';
  content: BlockParagraph[];
  attrs: BlockDefaultAttrs & { checked: boolean };
  marks?: MarkDiff[];
}
export interface BlockTaskList {
  type: 'taskList';
  content: BlockTaskItem[];
  attrs: BlockDefaultAttrs;
  marks?: MarkDiff[];
}

// ----- Blockquote
export interface BlockQuote {
  type: 'blockquote';
  content: BlockParagraph[];
  attrs: BlockDefaultAttrs;
  marks?: MarkDiff[];
}

// ----- Divider / separator / horizontal
export interface BlockHorizontalRule {
  type: 'horizontalRule';
  attrs: BlockDefaultAttrs;
  marks?: MarkDiff[];
}

// ----- Table
export interface BlockTableAttrs {
  colspan: number;
  rowspan: number;
  colwidth: number[] | null;
}
export interface BlockTableHeader {
  type: 'tableHeader';
  content: BlockParagraph[];
  attrs: BlockDefaultAttrs & BlockTableAttrs;
  marks?: MarkDiff[];
}
export interface BlockTableCell {
  type: 'tableCell';
  content: BlockParagraph[];
  attrs: BlockDefaultAttrs & BlockTableAttrs;
  marks?: MarkDiff[];
}
export interface BlockTableRow {
  type: 'tableRow';
  content: Array<BlockTableCell | BlockTableHeader>;
  attrs: BlockDefaultAttrs;
  marks?: MarkDiff[];
}
export interface BlockTable {
  type: 'table';
  content: BlockTableRow[];
  attrs: BlockDefaultAttrs;
  marks?: MarkDiff[];
}

// ----- Banner
export interface BlockBanner {
  type: 'banner';
  content: BlockParagraph[];
  attrs: BlockDefaultAttrs & { type: 'error' | 'info' | 'success' | 'warning' };
  marks?: MarkDiff[];
}

// ----- Vote
export interface BlockVoteItem {
  type: 'voteItem';
  content: BlockLevelOne[];
  attrs: BlockDefaultAttrs & { choiceId: string };
  marks?: MarkDiff[];
}
export interface BlockVote {
  type: 'vote';
  content: BlockVoteItem[];
  attrs: BlockDefaultAttrs & { voteId: string };
  marks?: MarkDiff[];
}

// ----- Image
export interface BlockImage {
  type: 'image';
  attrs: BlockDefaultAttrs & {
    src: string;
    alt: string | null;
    title: string | null;
  };
  marks?: MarkDiff[];
}

// ----- CodeBlock
export interface BlockCodeBlock {
  type: 'codeBlock';
  content: BlockText[];
  attrs: BlockDefaultAttrs & { language: string };
  marks?: MarkDiff[];
  codeDiff?: FileData;
}

// ----- Step
export interface BlockStep {
  type: 'step';
  content: BlockLevelOne[];
  attrs: BlockDefaultAttrs & {
    title?: string | null | undefined;
    stepId?: number | undefined;
  };
  marks?: MarkDiff[];
}

// ----- Document
export interface BlockDocument {
  type: 'blockDocument';
  attrs: BlockDefaultAttrs & { id: ApiDocument['id'] };
  marks?: MarkDiff[];
}

// _---------_
export interface BlockDoc<T = BlockLevelOne> {
  type: 'doc';
  content: T[];
}

export type BlockLevelZero<T = BlockLevelOne> = BlockDoc<T>;
export type BlockLevelOne =
  | BlockBanner
  | BlockBulletList
  | BlockCodeBlock
  | BlockDocument
  | BlockHeading
  | BlockHorizontalRule
  | BlockImage
  | BlockOrderedList
  | BlockParagraph
  | BlockQuote
  | BlockStep
  | BlockTable
  | BlockTaskList
  | BlockVote;
export type Blocks =
  | BlockBanner
  | BlockBulletList
  | BlockCodeBlock
  | BlockDocument
  | BlockHardBreak
  | BlockHeading
  | BlockHorizontalRule
  | BlockImage
  | BlockListItem
  | BlockOrderedList
  | BlockParagraph
  | BlockQuote
  | BlockStep
  | BlockTable
  | BlockTableCell
  | BlockTableHeader
  | BlockTableRow
  | BlockTaskItem
  | BlockTaskList
  | BlockText
  | BlockVote
  | BlockVoteItem;
export type BlocksWithContent =
  | BlockBanner
  | BlockBulletList
  | BlockCodeBlock
  | BlockHeading
  | BlockListItem
  | BlockOrderedList
  | BlockParagraph
  | BlockQuote
  | BlockStep
  | BlockTable
  | BlockTableCell
  | BlockTableHeader
  | BlockTableRow
  | BlockTaskItem
  | BlockTaskList
  | BlockVote
  | BlockVoteItem;
export type BlocksWithText = BlockCodeBlock | BlockHeading | BlockParagraph;
export type BlocksOfText = BlockHardBreak | BlockText;
