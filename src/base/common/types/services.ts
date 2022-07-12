import type { LogLevel } from '@opensumi/ide-core-common/lib/log';
import type { IDisposable } from '@opensumi/ide-utils/lib/disposable';
import type { ICodeWindowOptions, IWindowOpenOptions } from '@opensumi/ide-core-electron-main';
import type { Cookie, IpcMainInvokeEvent, MessageBoxOptions } from 'electron/common';
import type {
  Event as ElectronEvent,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  OpenDialogOptions,
  SaveDialogOptions,
  MessageBoxSyncOptions,
  CookiesGetFilter,
} from 'electron';

import type { WindowProps } from './app';

export const IDialogService = 'IDialogService';
export interface IDialogService {
  showOpenDialog: (options: OpenDialogOptions, winId?: number) => Promise<string[] | undefined>;
  showSaveDialog: (options: SaveDialogOptions, winId?: number) => Promise<string | undefined>;
  showMessageBoxSync: (options: MessageBoxSyncOptions, winId?: number) => number;
  showMessageBox: (options: MessageBoxOptions, winId?: number) => Promise<Electron.MessageBoxReturnValue>;
}

export const IWindow = 'IWindow';
export interface IWindow {
  id: number;
  name: string;
  result: unknown;
  browser: BrowserWindow;
  whenClosed: () => Promise<unknown>;
  whenClosing: () => Promise<unknown>;
  getBrowserWindow: () => BrowserWindow;
}

export interface EditorOptions {
  options?: {
    // gotoInfos?: string[];
    reopen?: boolean;
  }; // openEditor 方法自身的属性
  meta?: Record<string, any>; // 直接传送到 renderer 窗口内，全局可用
  codeOptions?: BrowserWindowConstructorOptions & ICodeWindowOptions;
  openOptions?: IWindowOpenOptions;
}

export interface AuthMeta {
  authType?: string;
  callbackUrl?: string;
}

export interface WindowOptions {
  meta?: Record<string, any | string[] | string | boolean | number>; // 直接传送到 renderer 窗口内，全局可用
  props?: WindowProps; // 用于通过 props 设置 browserWindowOptions 或者其它 helper/Window 内置的属性
  browserWindowOptions?: BrowserWindowConstructorOptions;
  browser?: BrowserWindow;
}

export const IWindowService = 'IWindowService';
export interface IWindowService {
  uris: Set<string>;
  gotoInfos: Set<string>;
  winMap: Map<number, IWindow>;
  open: (
    name: string,
    meta?: WindowOptions['meta'],
    browser?: BrowserWindow | BrowserWindowConstructorOptions,
  ) => Promise<IWindow | undefined>;
  openDashboard: (meta?: WindowOptions['meta']) => Promise<void>;
  hideDashboard: () => Promise<void>;
  closeDashboard: () => Promise<any>;
  openEditor: (workspace?: string, opts?: EditorOptions) => Promise<void>;
  close: (winId: number) => void;
  closeParent: (winId: number) => Promise<unknown> | null;
  minimize: (winId: number) => void;
  show: (winId: number) => void;
  hide: (winId: number) => void;
  resize: (winId: number, options: { width?: number; height?: number }) => void;
  setResult: (winId: number, result: unknown) => void;
  recentlyFocusWindow: () => IWindow | undefined;
  recentlyEditorWindow: () => BrowserWindow | null;
  setZoomFactorEditor: (factor: number) => void;
  getOneByName: (name: string) => IWindow | undefined;
  getOneIdByName: (name: string) => number | undefined;
  getAllByName: (name: string) => IWindow[];
  updateZoomFactor: (winId: number) => void;
  isLastEditor: (winId: number) => boolean;
  getCookies: (filter: CookiesGetFilter, partition?: string) => Promise<Cookie[]>;
  clearCookies: (filter?: CookiesGetFilter, partition?: string) => Promise<void>;
}

export interface IVersionInfo {
  type: string;
  frameworkVersion: string;
  clientCommit: string;
  clientVersion: string;
  date?: string;
  timestamp?: number;
}

export const DevVersionInfo: IVersionInfo = {
  type: 'dev',
  frameworkVersion: 'dev',
  clientCommit: 'dev',
  clientVersion: 'dev',
  date: new Date().toISOString(),
};

export const UnknownVersionInfo: IVersionInfo = {
  type: 'unknown',
  frameworkVersion: 'unknown',
  clientCommit: 'unknown',
  clientVersion: 'unknown',
  date: new Date().toISOString(),
};

export interface Meta {
  versions: IVersionInfo;
  rpcListenPath: string | null;
}

export const IMetaService = 'IMetaService';

export interface IMetaService {
  setRpcListenPath: (value: string) => void;
  meta: () => Promise<Meta>;
  versionsInfo: () => Promise<string>;
  getDisplayName: () => string;
}

export const ILoggerService = 'IAppLoggerService';
export interface ILoggerService {
  getLevel: () => Promise<LogLevel>;
  setLevel: (level: LogLevel) => Promise<void>;

  verbose: (...args: any[]) => Promise<void>;
  debug: (...args: any[]) => Promise<void>;
  log: (...args: any[]) => Promise<void>;
  info: (...args: any[]) => Promise<void>;
  warn: (...args: any[]) => Promise<void>;
  error: (...args: any[]) => Promise<void>;
  critical: (...args: any[]) => Promise<void>;

  dispose: () => Promise<void>;
}

export const IDockService = 'IDockService';
export interface IDockService { }

export const IEventService = 'IEventService';
export interface IEventService {
  on: (name: string, listener: (event: ElectronEvent, payload: any) => void) => IDisposable;
  once: (name: string, listener: (event: ElectronEvent, payload: any) => void) => IDisposable;
  emit: (name: string, arg: any, condition?: IEmitCondition) => void;
  onWait: (name: string, listener: (event: IpcMainInvokeEvent, payload: any) => void) => void;
  emitThen: <T = any>(name: string, payload: any, condition: IEmitCondition) => Promise<T | null>[];
}

export interface IEmitCondition {
  winName?: string;
  winId?: number;
  onlyFocus?: boolean;
}

export const IMenuService = 'IMenuService';
export interface IMenuService {
  initBaseMenu: () => void;
  updateMenu: () => void;
}
export type Platform = 'win32' | 'darwin';

export const IShellService = 'IShellService';
export interface IShellService {
  openItem: (path: string) => Promise<string>;
  openExternal: (uri: string) => Promise<void>;
  revealInFinder: (path: string) => Promise<void>;
  revealInSystemTerminal: (path: string) => Promise<void>;
}
