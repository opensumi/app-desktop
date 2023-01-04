import { LayoutConfig, SlotLocation } from '@opensumi/ide-core-browser';

export const customLayoutConfig: LayoutConfig = {
  [SlotLocation.top]: {
    modules: ['@opensumi/ide-menu-bar', '@opensumi/ide-top-tab'],
  },
  [SlotLocation.action]: {
    modules: ['@opensumi/ide-toolbar-action'],
  },
  [SlotLocation.left]: {
    modules: [
      '@opensumi/ide-explorer',
      '@opensumi/ide-search',
      '@opensumi/ide-extension-manager',
      '@opensumi/ide-debug',
    ],
  },
  [SlotLocation.right]: {
    modules: ['@opensumi/ide-scm'],
  },
  [SlotLocation.main]: {
    modules: ['@opensumi/ide-editor'],
  },
  [SlotLocation.bottom]: {
    modules: [
      '@opensumi/ide-terminal-next',
      '@opensumi/ide-output',
      'debug-console',
      '@opensumi/ide-markers',
      '@opensumi/ide-refactor-preview',
    ],
  },
  [SlotLocation.statusBar]: {
    modules: ['@opensumi/ide-status-bar'],
  },
  [SlotLocation.extra]: {
    modules: ['breadcrumb-menu'],
  },
};
