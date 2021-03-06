import { ipcMain, BrowserWindow, IpcMainEvent, IpcMainInvokeEvent } from 'electron';
import { Injectable, Autowired } from '@opensumi/di';
import { IWindowService, IEmitCondition, IEventService } from 'base/common/types/services';
import { BaseService } from 'base/common/services/base';

const DEFAULT_THEN_TIMEOUT = 1 * 60 * 1000;

interface EmitMeta {
  count: number;
}

@Injectable()
export class EventService extends BaseService implements IEventService {

  @Autowired(IWindowService)
  windowService: IWindowService;

  private eventPrefix = 'event-service:';

  private count = 0;

  private getBrowserWindow(condition: IEmitCondition) {
    const _browserWindows: BrowserWindow[] = [];

    if (condition.winName) {
      const wins = this.windowService.getAllByName(condition.winName);
      wins.forEach((win) => {
        const browser = BrowserWindow.fromId(win.id);
        if (browser) {
          _browserWindows.push(browser);
        }
      });
      return _browserWindows;
    }

    if (condition.winId) {
      const browser = BrowserWindow.fromId(condition.winId);
      if (browser) {
        _browserWindows.push(browser);
      }
      return _browserWindows;
    }

    if (condition.onlyFocus) {
      const browserWindow = BrowserWindow.getFocusedWindow();
      if (browserWindow) {
        _browserWindows.push(browserWindow);
      }
      return _browserWindows;
    }

    return BrowserWindow.getAllWindows();
  }

  on(name: string, listener: (event: IpcMainEvent, payload: any) => void) {
    ipcMain.on(this.eventPrefix + name, listener);
    return {
      dispose: () => {
        ipcMain.removeListener(this.eventPrefix + name, listener);
      },
    };
  }

  once(name: string, listener: (event: IpcMainEvent, payload: any) => void) {
    const _listener = (event: IpcMainEvent, payload: any) => {
      ipcMain.removeListener(this.eventPrefix + name, _listener);
      listener(event, payload);
    };
    ipcMain.on(this.eventPrefix + name, _listener);
    return {
      dispose: () => {
        ipcMain.removeListener(this.eventPrefix + name, _listener);
      },
    };
  }

  emit(name: string, payload: any, condition: IEmitCondition = {}) {
    const browserWindows = this.getBrowserWindow(condition);
    browserWindows.forEach((win: BrowserWindow) => {
      if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
        win.webContents.send(this.eventPrefix + name, payload);
      }
    });
  }

  /**
   * Main -- listen and wait send payload --> BrowserWindow
   * ???????????? Renderer ???????????????????????????????????? Renderer ????????????????????????
   * @param name
   * @param listener
   */
  onWait(name: string, listener: (event: IpcMainInvokeEvent, payload: any) => void) {
    const channel = `${this.eventPrefix}onWait:${name}`;
    ipcMain.handle(channel, async (e, arg) => listener(e, arg));
    return {
      dispose: () => {
        ipcMain.removeHandler(channel);
      },
    };
  }

  /**
   * Main -- send payload and wait result --> BrowserWindow
   * ???????????? name?????????????????????????????? Renderer ????????????????????????????????????????????????????????? Renderer EventService ??? onWait???
   * @param name
   * @param payload
   * @param condition
   * @returns
   */
  emitThen<T = any>(name: string, payload: any, condition: IEmitCondition = {}): Promise<T | null>[] {
    const browserWindows = this.getBrowserWindow(condition);
    return browserWindows.map((win: BrowserWindow) => {
      if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
        return Promise.resolve(null);
      }
      const _meta: EmitMeta = {
        count: this.count++,
      };
      win.webContents.send(`${this.eventPrefix}onWait:${name}`, payload, _meta);
      return new Promise<T>((resolve, reject) => {
        const channel = `onReply:${name}:${_meta.count}`;
        const handle = this.once(channel, (e, reply: T) => {
          resolve(reply);
        });

        setTimeout(() => {
          handle.dispose();
          reject(new Error(`[Main] ${channel} reply timeout`));
        }, DEFAULT_THEN_TIMEOUT);
      });
    });
  }

}
