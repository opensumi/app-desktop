import path from 'path';
import { app } from 'electron';
import { Injector } from '@opensumi/di';
import { URI } from '@opensumi/ide-utils/lib/uri';
import { serviceProviders, mainApiList } from 'base/main/services';
import {
  ILoggerService,
  IWindowService,
  IMetaService,
} from 'base/common/types/services';
import { ElectronMainApiRegistry, IElectronMainApiRegistry } from 'base/main/helper/api';
import { IMainApp } from 'base/common/types/app';
import { isDev } from 'base/common/utils/env';
import { GENERAL_BIN_PATH, getAppResourcePath, getVersions, isMac } from 'base/common/utils';
import { appId } from 'base/common/constants';

export class MainApp implements IMainApp {
  public injector: Injector = new Injector(serviceProviders);

  public logger: ILoggerService = this.injector.get(ILoggerService);

  public meta: IMetaService = this.injector.get(IMetaService);

  public win: IWindowService = this.injector.get(IWindowService);

  private started = false;

  constructor() {
    this.initServices();
    this.initMainApi();
    this.initEnv();
  }

  public makeReady() {
    for (const { token } of serviceProviders) {
      const ins = this.injector.get(token);
      if (!ins.onReady) {
        this.logger.warn(`${token} must inherit BaseService.`);
        continue;
      }
      // 如果 onReady 没有执行完， makeReadyCompleted 不会执行完
      ins
        .onReady()
        .catch((err: Error) => {
          this.logger.error(err.stack);
          console.error(err.stack);
          if (ins.dispose) {
            ins.dispose();
          }
        })
        .then(() => {
          ins.makeReadyCompleted();
        });
    }

    if (isDev) {
      // 开发模式下，禁用网站域隔离方便功能测试
      app.commandLine.appendSwitch('disable-site-isolation-trials');
    }

    this.logger.log('Main app is ready.');
  }

  public async start(mainEntry?: boolean) {
    // 真正第一次启动 mainEntry 为 true
    if (mainEntry && this.started) {
      return;
    }
    this.started = true;

    const { uris, gotoInfos } = this.win;

    const workspaces = Array.from(uris).filter((uri) => URI.parse(uri).scheme === 'file');
    workspaces.forEach((workspace) => {
      this.win.openEditor(workspace);
    });
    if (workspaces.length) {
      uris.clear();
      return;
    }
    if (gotoInfos.size) {
      // 如果 gotoInfos 也有数据，也要打开编辑器，以便打开文件
      this.win.openEditor();
      return;
    }

    // 显示最后一个 focus 的窗口
    const focusWindow = this.win.recentlyFocusWindow();
    // 忽略窗口是 menubar,quickpick
    if (focusWindow && focusWindow.name !== 'menubar' && focusWindow.name !== 'quickpick') {
      if (focusWindow.browser.isMinimized()) {
        focusWindow.browser.restore();
      }
      focusWindow.browser.show();
      return;
    }

    this.win.openDashboard();
  }

  private initServices() {
    this.injector.addProviders(
      { token: IMainApp, useValue: this },
      { token: IElectronMainApiRegistry, useClass: ElectronMainApiRegistry },
    );
  }

  private initMainApi() {
    const registry = this.injector.get(IElectronMainApiRegistry);
    for (const token of mainApiList) {
      registry.registerMainApi(token, this.injector.get(token));
    }
  }

  private initEnv() {
    const { clientVersion } = getVersions();
    process.env.SUMI_VERSION = clientVersion;
    // 指定当前的运行环境， Remote 模式需要通过这个判断
    process.env.resourcesPath = getAppResourcePath();
    process.env.cachePath = path.join(app.getPath('cache'), appId);

    if (isMac) {
      if (process.env.PATH?.indexOf(GENERAL_BIN_PATH) === -1) {
        process.env.PATH = `${GENERAL_BIN_PATH}:${process.env.PATH}`;
      }
    }
  }

  stop() {
    for (const { token } of serviceProviders) {
      const ins = this.injector.get(token);
      if (!ins.dispose) {
        continue;
      }
      ins.dispose().catch((err: Error) => {
        this.logger.error(err.stack);
      });
    }
    this.logger.log('Main app is stop.');
  }

  quit() {
    app.quit();
  }
}
