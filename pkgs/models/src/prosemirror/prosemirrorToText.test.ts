import { describe, expect, it } from 'vitest';

import { prosemirrorToText } from './prosemirrorToText.js';

describe('prosemirrorToText', () => {
  it('should output nothing', () => {
    const res = prosemirrorToText({ type: 'doc', content: [] });
    expect(res).toEqual('');
  });
  it('should output a text', () => {
    const res = prosemirrorToText({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          attrs: { uid: '1' },
          content: [
            {
              type: 'text',
              text: 'Foo',
            },
            {
              type: 'text',
              text: 'Bar',
            },
          ],
        },
      ],
    });
    expect(res).toEqual('FooBar');
  });
});
