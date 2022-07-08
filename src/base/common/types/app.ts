import type { ChildProcess } from 'child_process';
import type { Injector } from '@opensumi/di';

export const IMainApp = 'IMainApp';

export interface GeneralObj {
  [key: string]: any;
}

export interface IMainApp {
  makeReady: () => void;
  start: (mainEntry?: boolean) => Promise<void>;
  stop: () => void;
  quit: () => void;
}

// 这里的属性不全是 BrowserWindow 的属性
export interface WindowProps {
  name?: string;
  title?: string;
  modal?: boolean;
  parentId?: number;
  preload?: string;
  width?: number;
  height?: number;
  minWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  maxWidth?: number;
  resizable?: boolean;
  alwaysOnTop?: boolean;
  fullscreen?: boolean;
  singleton?: boolean;
  type?: string;
  wait?: boolean;
  show?: boolean;
  closable?: boolean;
  url?: string;
  timeout?: number; // ms
  titleBarStyle?: ('default' | 'hidden' | 'hiddenInset' | 'customButtonsOnHover');
  transparent?: boolean;
  frame?: boolean;
  backgroundColor?: string;
}

export interface DialogProps {
}

export interface NodeServerMeta {
  rpcListenPath: string;
  nodeProcess: ChildProcess;
}

export interface NodeClientMeta {
  injector: Injector;
  rpcListenPath: string;
}

export interface URIMeta {
  authority: string;
  action: string;
  params: Map<string, string>;
  originURI: string;
}
