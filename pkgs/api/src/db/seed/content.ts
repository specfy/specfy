import type { Project, User } from '../../models';
import { Document, TypeHasUser } from '../../models';

/**
 * Seed playbook
 */
export async function seedPlaybook(p1: Project, [u1]: User[]) {
  const d1 = await Document.create({
    id: '00100000-0000-4000-0000-000000000000',
    orgId: 'company',
    projectId: p1.id,
    type: 'pb',
    tldr: '',
    name: 'Restart Production',
    content: { content: [], type: 'doc' },
    locked: false,
  });
  const d2 = await Document.create({
    id: '00200000-0000-4000-0000-000000000000',
    orgId: 'company',
    projectId: p1.id,
    type: 'pb',
    tldr: '',
    name: 'Deploy',
    content: { content: [], type: 'doc' },
    locked: false,
  });
  const d3 = await Document.create({
    id: '00300000-0000-4000-0000-000000000000',
    orgId: 'company',
    projectId: p1.id,
    type: 'pb',
    tldr: '',
    name: 'Stop Production',
    content: { content: [], type: 'doc' },
    locked: false,
  });

  // Document has user
  await Promise.all([
    [d1.id, d2.id, d3.id].map((id) =>
      TypeHasUser.create({
        documentId: id,
        userId: u1.id,
        role: 'author',
      })
    ),
  ]);
}

/**
 * Seed RFC
 */
export async function seedRFC(p1: Project, [u1, u2]: User[]) {
  // Contents
  const d1 = await Document.create({
    id: '01000000-0000-4000-0000-000000000000',
    orgId: 'company',
    projectId: p1.id,
    type: 'rfc',
    name: 'API definition',
    tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
    content: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          content: [{ type: 'text', text: 'Overview' }],
          attrs: { level: 1 },
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque aliquam eget nibh eu sodales. Donec bibendum eros at tincidunt aliquam. Praesent non ipsum in enim elementum posuere. Aenean pellentesque et velit quis pretium. Duis et ligula imperdiet, fermentum nulla et, viverra magna. Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula. Nunc eget blandit metus. Etiam interdum laoreet libero eu pharetra. Phasellus lobortis mauris posuere velit finibus, a ultrices neque faucibus. Maecenas laoreet varius quam. ',
            },
            {
              type: 'text',
              text: 'A link to a documentation',
              marks: [
                {
                  attrs: {
                    href: 'http://localhost:5173/algolia/crawler',
                    target: '_blank',
                  },
                  type: 'link',
                },
              ],
            },
          ],
        },
        // {
        //   type: 'revision',
        //   content: [
        //   ]
        // },
        {
          type: 'heading',
          content: [{ type: 'text', text: 'Goals and Non-Goals' }],
          attrs: { level: 1 },
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Donec scelerisque ante vel felis gravida bibendum. Vestibulum quam purus, porta ac ornare sit amet, imperdiet at augue. Duis ac libero nec magna malesuada rhoncus at sit amet purus. Donec sed vulputate est. Donec accumsan ullamcorper auctor. Ut orci lectus, ornare id interdum sit amet, hendrerit et elit. Proin venenatis semper ipsum eget cursus. ',
            },
            {
              type: 'text',
              text: 'Aliquam nunc ante, sodales eget egestas id, elementum et dui.',
            },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'lorem ipsum',
                    },
                  ],
                },
              ],
            },
            {
              type: 'listItem',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'dolor ',
                      marks: [{ type: 'bold' }],
                    },
                    {
                      type: 'text',
                      text: ' sit ',
                      marks: [{ type: 'bold' }, { type: 'italic' }],
                    },
                    {
                      type: 'text',
                      text: 'amet',
                      marks: [{ type: 'italic' }],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          content: [{ type: 'text', text: 'Background & Motivation' }],
          attrs: { level: 1 },
        },
        {
          type: 'image',
          attrs: {
            src: 'https://source.unsplash.com/hbb6GkG6p9M/800x400',
            alt: null,
            title: null,
          },
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Pellentesque suscipit venenatis tellus vitae posuere. Donec at tellus ut ligula efficitur fermentum. Nam pharetra arcu et mattis porta. Aliquam vehicula quam non nisl tincidunt dignissim. Nunc egestas mi in ligula dignissim tristique. Vestibulum quis lacinia arcu. Fusce vehicula enim vitae erat feugiat, at laoreet tortor blandit.',
            },
          ],
        },
        {
          type: 'taskList',
          content: [
            {
              type: 'taskItem',
              attrs: { checked: true },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'A checked task.' }],
                },
              ],
            },
            {
              type: 'taskItem',
              attrs: { checked: false },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Not done.' }],
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          content: [{ type: 'text', text: 'Implementations' }],
          attrs: { level: 1 },
        },
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  text: '"This is a quote" -- Samuel Bodin, 2023',
                  type: 'text',
                },
              ],
            },
          ],
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Phasellus orci ante, lobortis vel ullamcorper at, placerat eget leo. Pellentesque in nisi aliquam, rutrum nunc quis, bibendum velit. Etiam efficitur lacinia cursus. ',
            },
            { type: 'text', text: 'This is code.', marks: [{ type: 'code' }] },
            {
              type: 'text',
              text: 'Duis neque nunc, consequat sit amet dignissim vel, semper a eros. Duis vel augue ut mauris molestie sodales nec id diam. Aenean blandit ornare nisl vitae venenatis. Ut accumsan ultricies lacinia. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Suspendisse potenti. Vestibulum ipsum dolor, rhoncus vel arcu non, sollicitudin eleifend quam. Fusce et nisi mi. Maecenas nisi quam, interdum at eros vitae, aliquam rutrum nunc. Praesent et pharetra dolor. Nam hendrerit nulla ex, vel lacinia ligula interdum a.',
            },
          ],
        },
        {
          type: 'heading',
          content: [{ type: 'text', text: 'Solutions' }],
          attrs: { level: 2 },
        },
        {
          type: 'vote',
          voteId: '', // TODO: fill this
          content: [
            {
              type: 'voteItem',
              voteChoice: '1',
              content: [
                {
                  type: 'heading',
                  content: [{ type: 'text', text: '#1 Naive solution' }],
                  attrs: { level: 3 },
                },
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Praesent sodales lorem id diam pellentesque, quis tincidunt risus porttitor. Vivamus dapibus aliquet ipsum. Nullam non leo neque. Aliquam in enim id nulla elementum pretium. Nullam scelerisque quam ut mattis egestas. Ut semper eros ipsum, eget rutrum nisi consequat vitae. Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo. Nunc id tellus felis. Suspendisse dui massa, volutpat ac tincidunt eu, cursus eget metus. Proin vel viverra mi. Maecenas a finibus felis, et dapibus orci. Sed molestie sed ex vitae sodales. Vestibulum ut leo posuere nulla commodo iaculis.',
                    },
                  ],
                },
              ],
            },
            {
              type: 'voteItem',
              voteChoice: '2',
              content: [
                {
                  type: 'heading',
                  content: [
                    { type: 'text', text: '#2 Over-engineered solution' },
                  ],
                  attrs: { level: 3 },
                },
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Praesent sodales lorem id diam pellentesque, quis tincidunt risus porttitor. Vivamus dapibus aliquet ipsum. Nullam non leo neque. Aliquam in enim id nulla elementum pretium. Nullam scelerisque quam ut mattis egestas. Ut semper eros ipsum, eget rutrum nisi consequat vitae. Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo. Nunc id tellus felis. Suspendisse dui massa, volutpat ac tincidunt eu, cursus eget metus. Proin vel viverra mi. Maecenas a finibus felis, et dapibus orci. Sed molestie sed ex vitae sodales. Vestibulum ut leo posuere nulla commodo iaculis.',
                    },
                  ],
                },
              ],
            },
          ],
        },
        // {
        //   type: 'code',
        //   attrs: {
        //     language: 'html',
        //   },
        //   content: [
        //     {
        //       text: '\u003Cdiv\u003Eprout\u003C\u002Fdiv\u003E\\n\u003Ccenter\u003E\u002F',
        //       type: 'text',
        //     },
        //   ],
        // },
        {
          type: 'table',
          content: [
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableHeader',
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: [150],
                  },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Name',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableHeader',
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Description',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              type: 'tableRow',
              content: [
                {
                  type: 'tableCell',
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Samuel Bodin',
                        },
                      ],
                    },
                  ],
                },
                {
                  type: 'tableCell',
                  attrs: {
                    colspan: 1,
                    rowspan: 1,
                    colwidth: null,
                  },
                  content: [
                    {
                      type: 'paragraph',
                      content: [
                        {
                          type: 'text',
                          text: 'Amazing developer much wow',
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          type: 'horizontalRule',
        },
        {
          type: 'heading',
          content: [{ type: 'text', text: 'FAQ' }],
          attrs: { level: 1 },
        },
        {
          type: 'panel',
          panelType: 'error',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Ut semper eros ipsum, eget rutrum nisi consequat vitae.',
                },
              ],
            },
          ],
        },
        {
          type: 'heading',
          content: [{ type: 'text', text: 'What is this awesome website?' }],
          attrs: { level: 2 },
        },
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Morbi sit amet porttitor justo, quis sagittis nulla. Donec et ullamcorper dolor. Maecenas pharetra imperdiet nulla nec commodo. ',
            },
          ],
        },
        {
          type: 'heading',
          content: [{ type: 'text', text: 'Thanks' }],
          attrs: { level: 4 },
        },
      ],
    },
    locked: true,
  });
  const d2 = await Document.create({
    id: '01100000-0000-4000-0000-000000000000',
    orgId: 'company',
    projectId: p1.id,
    type: 'rfc',
    name: 'Frontend definition',
    tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
    content: { type: 'doc', content: [] },
    locked: false,
  });
  const d3 = await Document.create({
    id: '01200000-0000-4000-0000-000000000000',
    orgId: 'company',
    projectId: p1.id,
    type: 'rfc',
    name: 'Use of Oauth2 in authentication system',
    tldr: 'Donec eget porttitor nisi. Proin ac augue bibendum, posuere dui vel, volutpat ligula.',
    content: { type: 'doc', content: [] },
    locked: false,
  });

  // Document has user
  await Promise.all([
    [d1.id, d2.id, d3.id].map((id) =>
      TypeHasUser.create({
        documentId: id,
        userId: u1.id,
        role: 'author',
      })
    ),
    TypeHasUser.create({
      documentId: d2.id,
      userId: u2.id,
      role: 'author',
    }),
  ]);
  await TypeHasUser.create({
    documentId: d1.id,
    userId: u2.id,
    role: 'reviewer',
  });
}
