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

// ----- Panel
export interface BlockPanel {
  type: 'panel';
  panelType: 'error' | 'info' | 'success' | 'warning';
  content: BlockParagraph[];
}

// ----- Vote
export interface BlockVoteItem {
  type: 'voteItem';
  voteChoice: string;
  content: BlockLevelOne[];
}
export interface BlockVote {
  type: 'vote';
  voteId: string;
  content: BlockVoteItem[];
}

// ----- Image
export interface BlockImage {
  type: 'image';
  attrs: { src: string; alt: string | null; title: string | null };
}

// _---------_
export interface BlockDoc {
  type: 'doc';
  content: BlockLevelOne[];
}

export type BlockLevelZero = BlockDoc;
export type BlockLevelOne =
  | BlockBulletList
  | BlockHeading
  | BlockHorizontalRule
  | BlockImage
  | BlockPanel
  | BlockParagraph
  | BlockQuote
  | BlockTable
  | BlockTaskList
  | BlockVote;
export type Blocks =
  | BlockBulletList
  | BlockHardBreak
  | BlockHeading
  | BlockHorizontalRule
  | BlockImage
  | BlockListItem
  | BlockPanel
  | BlockParagraph
  | BlockQuote
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
  | BlockBulletList
  | BlockHeading
  | BlockListItem
  | BlockPanel
  | BlockParagraph
  | BlockQuote
  | BlockTable
  | BlockTableCell
  | BlockTableHeader
  | BlockTableRow
  | BlockTaskItem
  | BlockTaskList
  | BlockVote
  | BlockVoteItem;
