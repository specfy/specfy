import type { ApiDocument } from './documents';

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
}
export interface BlockHardBreak {
  type: 'hardBreak';
}

// ----- Headings
export interface BlockHeading {
  type: 'heading';
  attrs: { level: 1 | 2 | 3 | 4 };
  content: BlockText[];
}

// ----- Bullet List
export interface BlockListItem {
  type: 'listItem';
  content: BlockParagraph[];
}
export interface BlockBulletList {
  type: 'bulletList';
  content: BlockListItem[];
}

// ----- Task List
export interface BlockTaskItem {
  type: 'taskItem';
  content: BlockParagraph[];
  attrs: { checked: boolean };
}
export interface BlockTaskList {
  type: 'taskList';
  content: BlockTaskItem[];
}

// ----- Blockquote
export interface BlockQuote {
  type: 'blockquote';
  content: BlockParagraph[];
}

// ----- Divider / separator / horizontal
export interface BlockHorizontalRule {
  type: 'horizontalRule';
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
  attrs: BlockTableAttrs;
}
export interface BlockTableCell {
  type: 'tableCell';
  attrs: BlockTableAttrs;
  content: BlockParagraph[];
}
export interface BlockTableRow {
  type: 'tableRow';
  content: Array<BlockTableCell | BlockTableHeader>;
}
export interface BlockTable {
  type: 'table';
  content: BlockTableRow[];
}

// ----- Banner
export interface BlockBanner {
  type: 'banner';
  attrs: { type: 'error' | 'info' | 'success' | 'warning' };
  content: BlockParagraph[];
}

// ----- Vote
export interface BlockVoteItem {
  type: 'voteItem';
  attrs: { choiceId: string };
  content: BlockLevelOne[];
}
export interface BlockVote {
  type: 'vote';
  attrs: { voteId: string };
  content: BlockVoteItem[];
}

// ----- Image
export interface BlockImage {
  type: 'image';
  attrs: { src: string; alt: string | null; title: string | null };
}

// ----- CodeBlock
export interface BlockCodeBlock {
  type: 'codeBlock';
  attrs: { language: string };
  content: BlockText[];
}

// ----- Step
export interface BlockStep {
  type: 'step';
  attrs: { title?: string };
  content: BlockLevelOne[];
}

// ----- Document
export interface BlockDocument {
  type: 'blockDocument';
  attrs: { id: ApiDocument['id'] };
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
