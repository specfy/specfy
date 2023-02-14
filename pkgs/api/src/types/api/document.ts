// ----- Text
export interface BlockText {
  type: 'text';
  text: string;
  marks?: Array<
    | { type: 'bold' }
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

// ----- Blockquote
export interface BlockQuote {
  type: 'blockquote';
  content: BlockParagraph[];
}

// ----- Divider / separator / horizontal
export interface BlockHorizontalRule {
  type: 'horizontalRule';
}

// export interface BlockPanel {
//   type: 'panel';
//   panelType: 'error' | 'info' | 'success' | 'warning';
//   content: BlockContent[];
// }

// export interface BlockTask {
//   type: 'task';
//   state: 'done' | 'todo';
//   content: BlockText[];
// }

// export interface BlockTaskList {
//   type: 'taskList';
//   content: BlockTask[];
// }

export interface BlockDoc {
  type: 'doc';
  content: BlockLevelOne[];
}

export type BlockLevelZero = BlockDoc;
export type BlockLevelOne =
  | BlockBulletList
  | BlockHeading
  | BlockHorizontalRule
  | BlockParagraph
  | BlockQuote;
export type Blocks =
  | BlockBulletList
  | BlockHardBreak
  | BlockHeading
  | BlockHorizontalRule
  | BlockListItem
  | BlockParagraph
  | BlockQuote
  | BlockText;
export type BlocksWithContent =
  | BlockBulletList
  | BlockHeading
  | BlockListItem
  | BlockParagraph
  | BlockQuote;
