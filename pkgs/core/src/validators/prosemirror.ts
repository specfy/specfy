import { z } from 'zod';

import { schemaId } from './schema.js';

// BlockText
const blockText = z
  .object({
    type: z.literal('text'),
    marks: z
      .array(
        z.discriminatedUnion('type', [
          z
            .object({
              type: z.literal('diffMark'),
              attrs: z.object({
                type: z.enum(['added', 'formatting', 'removed', 'unchanged']),
              }),
            })
            .strict(),
          z.object({ type: z.literal('bold') }).strict(),
          z.object({ type: z.literal('code') }).strict(),
          z.object({ type: z.literal('italic') }).strict(),
          z
            .object({
              type: z.literal('link'),
              attrs: z
                .object({
                  href: z.string().url(),
                  target: z.string().max(20),
                  class: z.string().nullable().optional(),
                })
                .strict(),
            })
            .strict(),
        ])
      )
      .optional(),
    text: z.string(),
  })
  .strict()
  .partial({ marks: true });

// BlockHardBreak
const blockHardBreak = z
  .object({
    type: z.literal('hardBreak'),
    attrs: z.object({ uid: schemaId }).strict(),
  })
  .strict();

// BlockParagraph
const blockParagraph = z
  .object({
    type: z.literal('paragraph'),
    attrs: z.object({ uid: schemaId }).strict(),
    content: z.array(z.discriminatedUnion('type', [blockText, blockHardBreak])),
  })
  .strict()
  .partial({ content: true }); // Can happen with placeholder and weird state in breakline

// BlockBanner
const blockBanner = z
  .object({
    type: z.literal('banner'),
    attrs: z
      .object({
        uid: schemaId,
        type: z.enum(['error', 'info', 'success', 'warning']),
      })
      .strict(),
    content: z.array(blockParagraph),
  })
  .strict();

// BlockListItem
const blockListItem = z
  .object({
    type: z.literal('listItem'),
    attrs: z.object({ uid: schemaId }).strict(),
    content: z.array(blockParagraph),
  })
  .strict();

// BlockBulletList
const blockBulletList = z
  .object({
    type: z.literal('bulletList'),
    attrs: z.object({ uid: schemaId }).strict(),
    content: z.array(blockListItem),
  })
  .strict();

// BlockCodeBlock
const blockCodeBlock = z
  .object({
    type: z.literal('codeBlock'),
    attrs: z.object({
      uid: schemaId,
      language: z.string().nonempty().max(25), // TODO: enforce this?
    }),
    content: z.array(blockText),
  })
  .strict();

// BlockDocument
const blockDocument = z
  .object({
    type: z.literal('blockDocument'),
    attrs: z.object({ uid: schemaId, id: schemaId }).strict(),
  })
  .strict();

// BlockHeading
const blockHeading = z
  .object({
    type: z.literal('heading'),
    attrs: z
      .object({ uid: schemaId, level: z.number().min(1).max(4) })
      .strict(),
    content: z.array(blockText),
  })
  .strict()
  .partial({ content: true }); // Can happen with just a hash (e.g: "# ")

// BlockHorizontalRule
const blockHorizontalRule = z
  .object({
    type: z.literal('horizontalRule'),
    attrs: z.object({ uid: schemaId }).strict(),
  })
  .strict();

// BlockImage
const blockImage = z
  .object({
    type: z.literal('image'),
    attrs: z
      .object({
        uid: schemaId,
        src: z.string().url(),
        alt: z.string().max(200).nullable(),
        title: z.string().max(200).nullable(),
      })
      .strict(),
  })
  .strict();

// BlockQuote
const blockQuote = z
  .object({
    type: z.literal('blockquote'),
    attrs: z.object({ uid: schemaId }).strict(),
    content: z.array(blockParagraph),
  })
  .strict();

// BlockTableCell
const schemaTableAttrs = z
  .object({
    colspan: z.number().min(0).max(100),
    rowspan: z.number().min(0).max(100),
    colwidth: z.array(z.number().min(0).max(700)).nullable(),
  })
  .strict();
const blockTableCell = z
  .object({
    type: z.literal('tableCell'),
    attrs: z.object({ uid: schemaId }).merge(schemaTableAttrs).strict(),
    content: z.array(blockParagraph),
  })
  .strict();

// BlockTableHeader
const blockTableHeader = z
  .object({
    type: z.literal('tableHeader'),
    attrs: z.object({ uid: schemaId }).merge(schemaTableAttrs).strict(),
    content: z.array(blockParagraph),
  })
  .strict();

// BlockTableRow
const blockTableRow = z
  .object({
    type: z.literal('tableRow'),
    attrs: z.object({ uid: schemaId }).strict(),
    content: z.array(
      z.discriminatedUnion('type', [blockTableCell, blockTableHeader])
    ),
  })
  .strict();

// BlockTable
const blockTable = z
  .object({
    type: z.literal('table'),
    attrs: z.object({ uid: schemaId }).strict(),
    content: z.array(blockTableRow),
  })
  .strict();

// BlockTaskItem
const blockTaskItem = z
  .object({
    type: z.literal('taskItem'),
    attrs: z.object({ uid: schemaId, checked: z.boolean() }).strict(),
    content: z.array(blockParagraph),
  })
  .strict();

// BlockTaskList
const blockTaskList = z
  .object({
    type: z.literal('taskList'),
    attrs: z.object({ uid: schemaId }).strict(),
    content: z.array(blockTaskItem),
  })
  .strict();

// BlockVoteItem
const blockVoteItem = z
  .object({
    type: z.literal('voteItem'),
    attrs: z.object({ uid: schemaId, choiceId: schemaId }).strict(),
    content: z.array(
      z.discriminatedUnion('type', [
        blockBanner,
        blockBulletList,
        blockCodeBlock,
        blockDocument,
        blockHeading,
        blockHorizontalRule,
        blockImage,
        blockParagraph,
        blockQuote,
        blockTable,
        blockTaskList,
      ])
    ),
  })
  .strict();

// BlockVote
const blockVote = z
  .object({
    type: z.literal('vote'),
    attrs: z.object({ uid: schemaId, voteId: schemaId }).strict(),
    content: z.array(blockVoteItem),
  })
  .strict();

// BlockStep
const blockStep = z
  .object({
    type: z.literal('step'),
    attrs: z
      .object({
        uid: schemaId,
        title: z.string().max(100).nullable().optional(),
        stepId: z.number().max(100).optional(),
      })
      .strict(),
    content: z.array(
      z.discriminatedUnion('type', [
        blockBanner,
        blockBulletList,
        blockCodeBlock,
        blockDocument,
        blockHeading,
        blockHorizontalRule,
        blockImage,
        blockParagraph,
        blockQuote,
        blockTable,
        blockTaskList,
      ])
    ),
  })
  .strict();

// BlockLevelOne
const blockLevelOne = z.array(
  z.discriminatedUnion('type', [
    blockBanner,
    blockBulletList,
    blockCodeBlock,
    blockDocument,
    blockHeading,
    blockHorizontalRule,
    blockImage,
    blockParagraph,
    blockQuote,
    blockStep,
    blockTable,
    blockTaskList,
    blockVote,
  ])
);

export const schemaProseMirror = z
  .object({
    type: z.literal('doc'),
    // BlockLevelOne
    content: blockLevelOne,
  })
  .strict();
