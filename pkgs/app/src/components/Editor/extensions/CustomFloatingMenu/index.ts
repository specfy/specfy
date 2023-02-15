import { Extension } from '@tiptap/core';

import type { FloatingMenuPluginProps } from './plugin';
import { FloatingMenuPlugin } from './plugin';

export type FloatingMenuOptions = Omit<
  FloatingMenuPluginProps,
  'editor' | 'element'
> & {
  element: HTMLElement | null;
};

export const CustomFloatingMenu = Extension.create<FloatingMenuOptions>({
  name: 'customFloatingMenu',

  addOptions() {
    return {
      element: null,
      tippyOptions: {},
      pluginKey: 'floatingMenu',
      shouldShow: null,
    };
  },

  addProseMirrorPlugins() {
    if (!this.options.element) {
      return [];
    }

    return [
      FloatingMenuPlugin({
        pluginKey: this.options.pluginKey,
        editor: this.editor,
        element: this.options.element,
        tippyOptions: this.options.tippyOptions,
        shouldShow: this.options.shouldShow,
      }),
    ];
  },
});
