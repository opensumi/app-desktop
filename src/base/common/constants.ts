import { isMacintosh, isLinux } from '@opensumi/ide-utils/lib/platform';
import type { WindowProps } from './types/app';
import { IMainApp } from './types/app';
import {
  IShellService,
  IWindowService,
  IDialogService,
  IMetaService,
  IMenuService,
  IMainStorageService,
  IRecentService,
  IEventService,
} from './types/services';

export const APP_NAME = 'app-desktop';
export const APP_URI_SCHEME = 'app-desktop';

export const extensionMarketplacePrefix = '/openapi/ide/';

export const appId = 'com.opensumi.app-desktop';

export const WINDOW_LIST: { [key: string]: WindowProps } = {
  dashboard: {
    title: 'dashboard',
    width: 1200,
    height: 800,
    singleton: true,
    type: 'simple',
    show: true,
    timeout: 1000,
    titleBarStyle: 'hidden',
  },
  editor: {
    title: 'editor',
    width: 1200,
    height: 800,
    minHeight: 760,
    minWidth: 934,
    type: 'normal',
    titleBarStyle: 'hidden',
    frame: false,
    show: false,
  },
  default: {
    title: 'default',
    width: 1200,
    height: 800,
    frame: false,
    type: 'simple',
    show: true,
    backgroundColor: '#2A3241',
    transparent: false,
  },
};

// macOS 上的红绿灯位置配置
export const generalTrafficLightPosition = { x: 9, y: 6 };

interface WindowType {
  [key: string]: {
    maximizable: boolean;
    minimizable: boolean;
    resizable: boolean;
    fullscreenable: boolean;
  };
}

export const WINDOW_TYPE: WindowType = {
  simple: {
    maximizable: false,
    minimizable: false,
    resizable: false,
    fullscreenable: false,
  },
  output: {
    maximizable: false,
    minimizable: false,
    resizable: false,
    fullscreenable: false,
  },
  normal: {
    maximizable: true,
    minimizable: true,
    resizable: true,
    fullscreenable: true,
  },
};

export enum TRACK_TOPIC {
  USER = 'UserTrace',
  LOG = 'AppLog',
  CRASH = 'AppCrash',
  PERFORMANCE = 'AppPerformance',
  USER_ACTION_TOPIC = 'USER_ACTION_TOPIC',
  SOLUTION_TOPIC = 'SOLUTION_TOPIC',
}

export const EVENT_TYPE = {
  APP_START: 'APP_START',
  APP_BEFORE_QUIT: 'APP_BEFORE_QUIT',
  APP_WINDOW_ALL_CLOSE: 'APP_WINDOW_ALL_CLOSE',
  APP_QUIT: 'APP_QUIT',
  APP_WILL_QUIT: 'APP_WILL_QUIT',
  APP_ACTIVATE: 'APP_ACTIVATE',
  WORKSPACE_LOAD_TIME: 'WORKSPACE_LOAD_TIME',
  OPEN_WINDOW_EDITOR_DURATION: 'OPEN_WINDOW_EDITOR_DURATION',
  START_SOLUTION: 'START_SOLUTION',
  RENDER_DURATION_NORMAL: 'RENDER_DURATION_NORMAL',
  RENDER_DURATION_EDITOR_INIT: 'RENDER_DURATION_EDITOR_INIT',
  RENDER_DURATION_EDITOR_DONE: 'RENDER_DURATION_EDITOR_DONE',
};

// 获取当前网络环境
export enum NETWORK_ENV {
  OFFLINE,
  INTRANET,
  INTERNET,
}

const DEFAULT_WINDOWS_FONT_FAMILY = "Consolas, 'Courier New', monospace";
const DEFAULT_MAC_FONT_FAMILY = "Menlo, Monaco, 'Courier New', monospace";
const DEFAULT_LINUX_FONT_FAMILY = "'Droid San Mono', 'monospace', monospace, 'Droid Sans Fallback'";
export const defaultPreferences = {
  'general.theme': 'vs-dark vscode-theme-themes-dark-json',
  'general.themeData': {
    editorBackground: '#1a2233',
    menuBarBackground: '#2a3141',
    panelBackground: '#1a2233',
    sideBarBackground: '#242c39',
    statusBarBackground: '#1b1f2a',
  },
  'general.icon': 'material-icon-theme',
  'general.language': 'zh-CN',
  'debug.toolbar.top': 27,
  'explorer.compactFolders': false,
  'settings.userBeforeWorkspace': true,
  'filesExclude': {
    '**/.git': true,
    '**/.tea': true,
    '**/.svn': true,
    '**/.hg': true,
    '**/CVS': true,
    '**/.DS_Store': true,
  },
  'iceworks.enableView': false,
  'iceworks.enableStatusBar': false,
  'general.autoOpenDashboard': true,
  'general.receiveNotify': false,
  'general.menubar.enableGlobalKeybinding': true,
  'general.quickpick.enableGlobalKeybinding': true,
  'general.quickpick.enableShowOnFullscreen': true,
  'view.saveLayoutWithWorkspace': true,
  'workbench.quickOpen.preserveInput': false,
  'terminal.fontFamily': isMacintosh
    ? DEFAULT_MAC_FONT_FAMILY
    : isLinux
      ? DEFAULT_LINUX_FONT_FAMILY
      : DEFAULT_WINDOWS_FONT_FAMILY,
  'toolbar.buttonTitleStyle': 'vertical',
};

// 支持 ipc 远程调用的列表
export const mainApiList = [
  IWindowService,
  IDialogService,
  IMetaService,
  IMenuService,
  IMainApp,
  IMainStorageService,
  IRecentService,
  IShellService,
];

export const RESOURCE_MANIFEST_VERSION = 1;

export const APPLICATIONS_DIR_PATH = '/Applications';
