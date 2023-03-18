import type { ApiDocument } from './documents';

export interface BlockDefaultAttrs {
  uid: string;
}

// ----- Text
export interface BlockText {
  type: 'text';
  text: string;
  marks?: Array<
    | { type: 'bold' }
    | { type: 'code' }
    | { type: 'italic' }
    | { type: 'link'; attrs: { href: string; target: string } }
  >;
  link?: string;
}
export interface BlockParagraph {
  type: 'paragraph';
  content?: Array<BlockHardBreak | BlockText>;
  attrs: BlockDefaultAttrs;
}
export interface BlockHardBreak {
  type: 'hardBreak';
  attrs: BlockDefaultAttrs;
}

// ----- Headings
export interface BlockHeading {
  type: 'heading';
  content: BlockText[];
  attrs: BlockDefaultAttrs & { level: 1 | 2 | 3 | 4 };
}

// ----- Bullet List
export interface BlockListItem {
  type: 'listItem';
  content: BlockParagraph[];
  attrs: BlockDefaultAttrs;
}
export interface BlockBulletList {
  type: 'bulletList';
  content: BlockListItem[];
  attrs: BlockDefaultAttrs;
}

// ----- Task List
export interface BlockTaskItem {
  type: 'taskItem';
  content: BlockParagraph[];
  attrs: BlockDefaultAttrs & { checked: boolean };
}
export interface BlockTaskList {
  type: 'taskList';
  content: BlockTaskItem[];
  attrs: BlockDefaultAttrs;
}

// ----- Blockquote
export interface BlockQuote {
  type: 'blockquote';
  content: BlockParagraph[];
  attrs: BlockDefaultAttrs;
}

// ----- Divider / separator / horizontal
export interface BlockHorizontalRule {
  type: 'horizontalRule';
  attrs: BlockDefaultAttrs;
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
}
export interface BlockTableCell {
  type: 'tableCell';

  content: BlockParagraph[];
  attrs: BlockDefaultAttrs & BlockTableAttrs;
}
export interface BlockTableRow {
  type: 'tableRow';
  content: Array<BlockTableCell | BlockTableHeader>;
  attrs: BlockDefaultAttrs;
}
export interface BlockTable {
  type: 'table';
  content: BlockTableRow[];
  attrs: BlockDefaultAttrs;
}

// ----- Banner
export interface BlockBanner {
  type: 'banner';
  content: BlockParagraph[];
  attrs: BlockDefaultAttrs & { type: 'error' | 'info' | 'success' | 'warning' };
}

// ----- Vote
export interface BlockVoteItem {
  type: 'voteItem';
  content: BlockLevelOne[];
  attrs: BlockDefaultAttrs & { choiceId: string };
}
export interface BlockVote {
  type: 'vote';
  content: BlockVoteItem[];
  attrs: BlockDefaultAttrs & { voteId: string };
}

// ----- Image
export interface BlockImage {
  type: 'image';
  attrs: BlockDefaultAttrs & {
    src: string;
    alt: string | null;
    title: string | null;
  };
}

// ----- CodeBlock
export interface BlockCodeBlock {
  type: 'codeBlock';
  content: BlockText[];
  attrs: BlockDefaultAttrs & { language: string };
}

// ----- Step
export interface BlockStep {
  type: 'step';
  content: BlockLevelOne[];
  attrs: BlockDefaultAttrs & { title?: string };
}

// ----- Document
export interface BlockDocument {
  type: 'blockDocument';
  attrs: BlockDefaultAttrs & { id: ApiDocument['id'] };
}

// _---------_
export interface BlockDoc {
  type: 'doc';
  content: BlockLevelOne[];
}

export type BlockLevelZero = BlockDoc;
export type BlockLevelOne =
  | BlockBanner
  | BlockBulletList
  | BlockCodeBlock
  | BlockDocument
  | BlockHeading
  | BlockHorizontalRule
  | BlockImage
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
