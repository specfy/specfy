import { vi } from 'vitest';

import type { Mock } from 'vitest';

// https://github.com/ueberdosis/tiptap/issues/4455
class ClipboardEventMock extends Event {
  clipboardData: {
    getData: Mock<any, [string]>;
    setData: Mock<any, [string, string]>;
  };

  constructor(type: string, eventInitDict?: EventInit) {
    super(type, eventInitDict);
    this.clipboardData = {
      getData: vi.fn(),
      setData: vi.fn(),
    };
  }
}
class DragEventMock extends Event {
  dataTransfer: {
    getData: Mock<any, [string]>;
    setData: Mock<any, [string, string]>;
  };
  constructor(type: string, eventInitDict?: EventInit) {
    super(type, eventInitDict);
    this.dataTransfer = {
      getData: vi.fn(),
      setData: vi.fn(),
    };
  }
}
(globalThis as any).DragEvent = DragEventMock;

(globalThis as any).ClipboardEvent = ClipboardEventMock;
