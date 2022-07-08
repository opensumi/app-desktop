import os from 'os';
import omit from 'lodash/omit';
import type { Cookies, CookiesGetFilter, Session } from 'electron';
import { app, BrowserWindow, session } from 'electron';
import { URI } from '@opensumi/ide-core-common';
import type { Injector } from '@opensumi/di';
import { Injectable, Autowired, INJECTOR_TOKEN } from '@opensumi/di';
import { DEFAULT_WORKSPACE_SUFFIX_NAME } from '@opensumi/ide-workspace';
import type { IWindowService, EditorOptions, WindowOptions } from 'base/common/types/services';
import {
  ILoggerService,
  IMenuService,
  IEventService,
} from 'base/common/types/services';
import { WINDOW_LIST } from 'base/common/constants';

import { fsp } from 'base/common/utils';
import { getEditor, initEditor } from 'editor/main';

import { BaseService } from 'base/common/services/base';
import { Window } from '../helper/window';

export interface DialogProps {
  parentId: number;
  modal: boolean;
  payload: Record<string, string>;
}

@Injectable()
export class WindowService extends BaseService implements IWindowService {
  @Autowired(INJECTOR_TOKEN)
  private injector: Injector;

  @Autowired(ILoggerService)
  private logger: ILoggerService;

  @Autowired(IMenuService)
  private menuService: IMenuService;

  @Autowired(IEventService)
  private eventService: IEventService;

  private editorReady = false;

  public winMap = new Map<number, Window>();

  private _userHome: string;

  public uris = new Set<string>();

  public gotoInfos = new Set<string>();

  constructor() {
    super();
    this._userHome = os.homedir();
    // 初始化 Editor 的实例
    initEditor({
      injector: this.injector,
    });
  }

  get userHome() {
    return this._userHome;
  }

  async getEditor() {
    const editor = getEditor();
    if (!this.editorReady) {
      await editor.init();
      this.editorReady = true;
    }
    return editor;
  }

  async open(name: string, options: WindowOptions = {}) {
    await app.whenReady();

    options.meta = {
      ...options.meta,
      name,
      userHome: this.userHome,
      windowStartTime: `${Date.now()}`,
    };

    // 创建新窗口
    const win = this.injector.get(Window, [name, options]);
    if (!win || !win.browser) {
      // 单例模式，如果重复执行会没有 browser
      const existWin = this.getOneByName(name);
      if (existWin) {
        // 更新 metadata 信息
        this.eventService.emit('metadata', options.meta, { winId: existWin.id });
      }
      return;
    }
    this.winMap.set(win.id, win);
    win.whenClosed().then(() => this.winMap.delete(win.id));

    if (name !== 'editor') {
      // 针对非Editor窗口初始化默认的顶部菜单
      this.menuService.initBaseMenu();
    }
    this.logger.log('Opening window:', name, win.url);
    return win;
  }

  async hideDashboard() {
    const win = this.getOneByName('dashboard');
    if (win) {
      this.hide(win.id);
    }
  }

  async openDashboard(meta?: WindowOptions['meta']) {
    const win = this.getOneByName('dashboard');
    if (win) {
      this.show(win.id);
      this.eventService.emit('dashboard-message', { message: meta?.message }, { winId: win.id });
      return;
    }
    await this.open('dashboard', { meta });
  }

  async openDialog(name: string, options?: DialogProps) {
    await this.open(name, {
      props: {
        ...options,
      },
    });
  }

  async closeDashboard() {
    const win = this.getOneByName('dashboard');
    if (win) {
      win.close();
      return win.whenClosed();
    }
    return null;
  }

  isLastEditor(winId: number) {
    const wins = this.getAllByName('editor');
    return wins.length === 1 && wins[0].id === winId;
  }

  private drainGotoInfos() {
    const gotoInfos = Array.from(this.gotoInfos);
    if (gotoInfos.length > 0) {
      this.gotoInfos.clear();
      return gotoInfos;
    }
    return [];
  }

  /**
   * 打开单文件的方式：
   * 如果有编辑器窗口，就打开最后一个 focus 的窗口并且打开
   * - 发送 open-file 就可以打开
   * 如果没有编辑器窗口，新建窗口，并且打开 workspace 指向的文件路径，并且打开 goto 参数的文件
   * - 先新建新的窗口，然后打开新的窗口
   * - 发送要打开的文件
   * @param workspaceUri
   * @param gotoInfos
   * @returns
   */
  private async handleOpenFile(workspaceUri: URI, gotoInfos: string[]) {
    let fileMode = false;
    let editorWindow: BrowserWindow | null = null;

    const workspace = workspaceUri.codeUri.fsPath;

    try {
      const workspaceStat = await fsp.stat(workspaceUri.codeUri.fsPath);
      fileMode = workspaceStat.isFile() && !workspaceUri.codeUri.fsPath.endsWith(`.${DEFAULT_WORKSPACE_SUFFIX_NAME}`);
      editorWindow = await this.getParentWorkspaceEditorWindow(workspaceUri.codeUri.fsPath);
    } catch (error) {
      this.logger.error(error);
      if (workspace) {
        // 有可能 workspace 是空
        this.openDashboard();
        return;
      }
    }
    if (editorWindow) {
      if (!workspace && gotoInfos?.length) {
        this.eventService.emit('open-file', { gotoInfos }, { winId: editorWindow.id });
        return;
      }
      if (fileMode) {
        if (gotoInfos?.length) {
          // 由于同时发送两个 open-file，kaitian 在同时打开
          this.eventService.emit(
            'open-file',
            { openFile: workspaceUri.toString(), gotoInfos },
            { winId: editorWindow.id },
          );
        } else {
          this.eventService.emit('open-file', { openFile: workspaceUri.toString() }, { winId: editorWindow.id });
        }
        return;
      }
      if (gotoInfos?.length) {
        this.eventService.emit('open-file', { gotoInfos }, { winId: editorWindow.id });
      }
    }

    return fileMode;
  }

  /**
   * @param workspace Uri string | FilePath 可以是一个 uri string 或者 file path
   * @param opts EditorOptions
   * @returns Promise<void>
   */
  async openEditor(workspace = '', opts: EditorOptions = {}) {
    const meta = opts.meta || {};
    const editor = await this.getEditor();
    const workspaceUri = URI.isUriString(workspace) ? URI.parse(workspace) : URI.file(workspace);
    const gotoInfos = this.drainGotoInfos();
    meta.gotoInfos = gotoInfos?.length ? gotoInfos : [];

    let fileMode: boolean | undefined = false;
    fileMode = await this.handleOpenFile(workspaceUri, gotoInfos);
    if (typeof fileMode === 'undefined') {
      // 已经通过 open-file 事件打开
      return;
    }

    this.logger.log('Open editor:', workspaceUri.toString());

    const foundWindow = editor.getCodeWindowByWorkspace(workspace);
    if (foundWindow) {
      if (opts.options?.reopen) {
        foundWindow.close();
      } else {
        foundWindow.getBrowserWindow().show();
        return;
      }
    }

    const projectPath = fileMode ? '' : workspace;
    const codeOptions = {
      ...omit(WINDOW_LIST.editor, ['titleBarStyle']),
      ...opts.codeOptions,
      backgroundColor: '#1a2233',
      query: { metadata: JSON.stringify({ windowStartTime: Date.now() }) },
    };
    const metadata = {
      ...meta,
      name: 'editor',
      openFile: fileMode ? workspace : '',
      userHome: this.userHome,
      workspaceUri: workspaceUri.toString(),
    };

    this.closeDashboard();

    const editorInstance = editor.loadWorkspace(projectPath, metadata, codeOptions, opts.openOptions);
    const win = await this.open('editor', {
      meta: metadata,
      browser: editorInstance.getBrowserWindow(),
    });

    win?.browser.webContents.setBackgroundThrottling(true);
    win?.show();
  }

  updateZoomFactor(winId: number) {
  }

  async close(winId: number) {
    const win = this.winMap.get(winId);
    if (win) {
      if (!win.browser.closable) {
        win.browser.setClosable(true);
      }
      win.close();
      return win.whenClosed();
    }
    return null;
  }

  /**
   * 关闭子窗口的父窗口
   * @param winId 子窗口的 window id
   * @returns 可以等待到结束
   */
  async closeParent(winId: number) {
    const win = this.winMap.get(winId);
    const parentBrowser = win?.browser.getParentWindow();
    if (parentBrowser) {
      win?.browser.close();
      parentBrowser.close();
      const parentWin = this.winMap.get(winId);
      if (parentWin) {
        return parentWin.whenClosed();
      }
    }
    return null;
  }

  minimize(winId: number) {
    const win = this.winMap.get(winId);
    if (win) {
      win.browser.minimize();
    }
  }

  reload(winId: number) {
    const win = this.winMap.get(winId);
    if (win) {
      win.browser.reload();
    }
  }

  show(winId: number) {
    const win = this.winMap.get(winId);
    if (win) {
      win.browser.show();
    }
  }

  hide(winId: number) {
    const win = this.winMap.get(winId);
    if (win) {
      win.browser.blur();
      win.browser.hide();
    }
  }

  resize(winId: number, options: { width?: number; height?: number }) {
    const win = this.winMap.get(winId);
    if (win) {
      const [width, height] = win.browser.getSize();
      win.browser.setSize(options.width || width, options.height || height);
    }
  }

  setResult(winId: number, result: unknown) {
    this.logger.log('setResult', winId, result);
    const win = this.winMap.get(winId);
    if (win) {
      win.result = result;
    }
  }

  getOneByName(name: string): Window | undefined {
    for (const [, win] of this.winMap) {
      if (win.name === name) {
        return win;
      }
    }
  }

  getOneIdByName(name: string): number | undefined {
    const win = this.getOneByName(name);
    return win?.id;
  }

  getAllByName(name: string): Window[] {
    const wins: Window[] = [];
    for (const [, win] of this.winMap) {
      if (win.name === name) {
        wins.push(win);
      }
    }
    return wins;
  }

  recentlyFocusWindow(): Window | undefined {
    const focusWindow = BrowserWindow.getFocusedWindow();
    if (focusWindow) {
      return this.winMap.get(focusWindow.id);
    }

    return undefined;
  }

  /**
   * 查找运行中的编辑器实例
   * @returns Promise<BrowserWindow | null>
   */
  recentlyEditorWindow(): BrowserWindow | null {
    const lastBrowser = this.recentlyFocusWindow();
    if (lastBrowser) {
      const win = this.winMap.get(lastBrowser.id);
      if (win?.name === 'editor') {
        return win.browser;
      }
    }

    const editors = this.getAllByName('editor');
    return editors.length ? editors[0].browser : null;
  }

  setZoomFactorEditor(factor: number) {
    const wins = this.getAllByName('editor');
    wins.forEach((win) => {
      win.browser.webContents.setZoomFactor(factor);
    });
  }

  /**
   * 根据项目路径找到对应的窗口，如果找不到就返回最近访问的编辑器窗口
   * @param filePath 项目路径
   * @returns
   */
  async getParentWorkspaceEditorWindow(filePath: string): Promise<BrowserWindow | null> {
    const editor = await this.getEditor();
    for (const codeWindow of editor.getCodeWindows()) {
      const { workspace } = codeWindow;
      if (workspace && filePath?.startsWith(workspace.codeUri.fsPath)) {
        return codeWindow.getBrowserWindow();
      }
    }
    return this.recentlyEditorWindow();
  }

  async getCookies(filter: CookiesGetFilter, partition?: string) {
    let cookies: Cookies;
    if (partition) {
      cookies = session.fromPartition(partition).cookies;
    } else {
      cookies = session.defaultSession.cookies;
    }

    return cookies.get(filter);
  }

  async clearCookies(filter?: CookiesGetFilter, partition?: string) {
    let sess: Session;
    if (partition) {
      sess = session.fromPartition(partition);
    } else {
      sess = session.defaultSession;
    }

    if (!filter) {
      return sess.clearStorageData({ storages: ['cookies'] });
    }

    const cookies = await sess.cookies.get(filter);
    await Promise.all(
      cookies.map((cookie) => {
        let url = '';
        // get prefix, like https://www.
        url += cookie.secure ? 'https://' : 'http://';
        url += cookie.domain?.charAt(0) === '.' ? 'www' : '';
        // append domain and path
        url += cookie.domain;
        url += cookie.path;
        this.logger.log('清理 cookies', url);
        return sess.cookies.remove(url, cookie.name);
      }),
    );
  }
}
