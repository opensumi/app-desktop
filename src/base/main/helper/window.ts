import { resolve } from 'path';
import qs from 'querystring';
import type { BrowserWindowConstructorOptions, WebPreferences } from 'electron';
import { shell, BrowserWindow } from 'electron';
import { Injectable, Autowired, Optional } from '@opensumi/di';
import { URI } from '@opensumi/ide-utils/lib/uri';
import { generalTrafficLightPosition, WINDOW_LIST, WINDOW_TYPE } from 'base/common/constants';
import type { IWindow, WindowOptions } from 'base/common/types/services';
import {
  ILoggerService,
  IWindowService,
  IEventService,
  IMenuService,
} from 'base/common/types/services';
import type { WindowProps } from 'base/common/types/app';
import { IMainApp } from 'base/common/types/app';

interface MeasureInfo {
  id: string | null;
  startTime?: number;
}

@Injectable({ multiple: true })
export class Window implements IWindow {
  @Autowired(IWindowService)
  private windowService: IWindowService;

  @Autowired(ILoggerService)
  private logger: ILoggerService;

  @Autowired(IEventService)
  private eventService: IEventService;

  @Autowired(IMenuService)
  private menuService: IMenuService;

  @Autowired(IMainApp)
  private mainApp: IMainApp;

  private measureMap = new Map<string, MeasureInfo>();

  public browser: BrowserWindow;

  public props: WindowProps;

  public meta: Record<string, Record<string, unknown> | string[] | string | boolean | number>;

  public id: number;

  public result: any = null;

  public title?: string;

  public wait: boolean;

  public url: string;

  constructor(readonly name: string, @Optional() options: WindowOptions) {
    this.meta = options.meta || {};
    this.props = { ...WINDOW_LIST.default, ...WINDOW_LIST[name], ...options.props };

    if (this.props.singleton) {
      const win = this.windowService.getOneByName(name);
      if (win) {
        if (!win.browser.isDestroyed()) {
          win.browser.show();
        }
        return;
      }
    }

    this.wait = this.props.wait || false;
    this.title = this.props.title;
    this.logger.log('Create window', name);

    if (options.browser && options.browser instanceof BrowserWindow) {
      this.browser = options.browser;
      this.id = this.browser.id;
    } else {
      const browserWindowOptions = this.configBrowserWindowOptions(this.props, options.browserWindowOptions);
      this.browser = new BrowserWindow(browserWindowOptions);
      this.id = this.browser.id;
      if (browserWindowOptions.show === false && this.props.timeout) {
        setTimeout(() => this.show(), this.props.timeout);
      }

      const query = {
        metadata: JSON.stringify(this.meta),
        windowId: this.id,
        webContentsId: this.browser.webContents.id,
      };
      this.url = URI.file(resolve(__dirname, options.props?.url || `../pages/${this.name}/index.html`))
        .withQuery(qs.stringify(query))
        .toString();
      this.browser.loadURL(this.url);

      this.handleWindowOpen();
    }

    if (process.env.DEV_TOOLS) {
      this.browser.webContents.openDevTools({ mode: 'detach' });
    }
  }

  configBrowserWindowOptions(
    props: WindowProps,
    browserWindowOptions?: BrowserWindowConstructorOptions,
  ): BrowserWindowConstructorOptions {
    const windowTypeOptions = WINDOW_TYPE[props.type || 'normal'];
    const webPreferences: WebPreferences = { ...browserWindowOptions?.webPreferences };
    if (props.type === 'simple') {
      // 小窗口尽快显示，在遮挡的情况下，界面重绘会延迟
      webPreferences.backgroundThrottling = false;
    }

    const parent = props.parentId && BrowserWindow.fromId(props.parentId);

    return {
      ...windowTypeOptions,
      parent: parent || undefined,
      modal: props.modal,
      show: props.show,
      width: props.width,
      height: props.height,
      maxHeight: props.maxHeight,
      maxWidth: props.maxWidth,
      trafficLightPosition: generalTrafficLightPosition,
      resizable: props.resizable === undefined ? windowTypeOptions.resizable : props.resizable,
      alwaysOnTop: props.alwaysOnTop,
      transparent: props.transparent,
      closable: typeof props.closable === 'undefined' ? true : props.closable,
      frame: props.frame,
      titleBarStyle: props.titleBarStyle,
      // TODO: 根据Mac环境主题色切换 systemPreferences.isDarkMode()
      backgroundColor: props.transparent ? undefined : props.backgroundColor,
      ...browserWindowOptions,
      webPreferences: {
        nodeIntegration: true,
        // nodeIntegrationInWorker: false,
        contextIsolation: false,
        preload: props.preload,
        webviewTag: true,
        webSecurity: false,
        allowRunningInsecureContent: true,
        zoomFactor: 1.0,
        ...webPreferences,
      },
    };
  }

  close() {
    if (!this.browser.isDestroyed()) {
      this.browser.close();
    }
  }

  show() {
    if (!this.browser.isDestroyed()) {
      this.browser.show();
    }
  }

  whenClosing() {
    return new Promise((resolve) => {
      this.browser.on('close', () => {
        resolve(this.result);
      });
    });
  }

  whenClosed() {
    return new Promise((resolve) => {
      this.browser.on('closed', () => {
        resolve(this.result);
      });
    });
  }

  getBrowserWindow() {
    return this.browser;
  }

  async handleWindowOpen() {
    this.browser.webContents.on('will-navigate', (event, url) => {
      event.preventDefault();
      shell.openExternal(url);
    });
    this.browser.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return {
        action: 'deny',
      };
    });
  }
}
