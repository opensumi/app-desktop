import { Injectable } from '@opensumi/di';
import type { IDisposable } from '@opensumi/ide-utils/lib/disposable';
import { ipcRenderer, IpcRendererEvent } from 'electron';

const DEFAULT_THEN_TIMEOUT = 1 * 60 * 1000;

export const IEventService = 'IEventService';
export interface IEventService {
  on: (name: string, listener: (event: IpcRendererEvent, payload?: any) => void) => IDisposable;
  once: (name: string, listener: (event: IpcRendererEvent, payload: any) => void) => IDisposable;
  emit: (name: string, payload?: any) => void;
  removeAllListener: (name: string) => void;
  onWait: (name: string, listener: (event: IpcRendererEvent, payload: any) => Promise<any>) => void;
  emitThen: <T = any>(name: string, payload: any) => Promise<T>;

  onWebContents: (name: string, listener: (event: IpcRendererEvent, payload: any) => void) => IDisposable;
  emitToWebContents: (webContentsId: number, name: string, payload: any) => void;
  onWebContentsWait: (name: string, listener: (event: IpcRendererEvent, payload: any) => Promise<void>) => IDisposable;
  emitToWebContentsThen: <T = any>(webContentsId: number, name: string, payload: any) => Promise<T>;
}

interface EmitMeta {
  count: number;
}

interface WebContentsEmitMeta {
  count: number;
}

@Injectable()
export class EventService implements IEventService {
  private eventPrefix = 'event-service:';

  private count = 0;

  on(name: string, listener: (event: IpcRendererEvent, payload?: any) => void) {
    ipcRenderer.on(this.eventPrefix + name, listener);
    return {
      dispose: () => {
        ipcRenderer.removeListener(this.eventPrefix + name, listener);
      },
    };
  }

  once(name: string, listener: (event: IpcRendererEvent, payload: any) => void) {
    const _listener = (event: IpcRendererEvent, payload: any) => {
      ipcRenderer.removeListener(this.eventPrefix + name, _listener);
      listener(event, payload);
    };
    ipcRenderer.on(this.eventPrefix + name, _listener);
    return {
      dispose: () => {
        ipcRenderer.removeListener(this.eventPrefix + name, _listener);
      },
    };
  }

  emit(name: string, payload: any) {
    ipcRenderer.send(this.eventPrefix + name, payload);
  }

  removeAllListener(name: string) {
    ipcRenderer.removeAllListeners(this.eventPrefix + name);
  }

  /**
   * ???????????? main ???????????????????????????????????? main ??????
   * @param name
   * @param listener
   */
  onWait(name: string, listener: (event: IpcRendererEvent, payload: any) => Promise<void>) {
    ipcRenderer.on(`${this.eventPrefix}onWait:${name}`, async (e, payload, _meta: EmitMeta) => {
      const result = await listener(e, payload);
      this.emit(`${this.eventPrefix}onReply:${name}:${_meta.count}`, result);
    });
  }

  emitThen(name: string, payload: any) {
    return ipcRenderer.invoke(`${this.eventPrefix}onWait:${name}`, payload);
  }

  /**
   * ?????? Renderer ???????????????
   * ?????????????????? Renderer ??????????????????????????? emitToWebContents
   * @param name
   * @param listener
   */
  onWebContents(name: string, listener: (event: IpcRendererEvent, payload: any) => void) {
    const channelWait = `${this.eventPrefix}onWebContentsWait:${name}`;
    ipcRenderer.on(channelWait, listener);
    return {
      dispose: () => {
        ipcRenderer.removeListener(channelWait, listener);
      },
    };
  }

  /**
   * ?????? Renderer ???????????????
   * ???????????? name????????? Renderer EventService ??? onWebContents???
   * > ?????????????????? webContents??????????????????????????????????????????????????? Main ????????????????????????????????????????????????
   * > https://github.com/electron/electron/issues/7193
   * @param name
   * @param payload
   */
  emitToWebContents(webContentsId: number, name: string, payload: any) {
    ipcRenderer.sendTo(webContentsId, `${this.eventPrefix}onWebContentsWait:${name}`, payload);
  }

  /**
   * ?????? Renderer ???????????????
   * ?????????????????? Renderer ??????????????????????????? emitToWebContentsThen
   * @param name
   * @param listener
   */
  onWebContentsWait(name: string, listener: (event: IpcRendererEvent, payload: any) => Promise<void>) {
    const channelWait = `${this.eventPrefix}onWebContentsWait:${name}`;
    const _listener = async (e, payload, _meta: WebContentsEmitMeta) => {
      const result = await listener(e, payload);
      const channel = `${this.eventPrefix}onWebContentsReply:${name}:${_meta.count}`;
      e.sender.sendTo(e.senderId, channel, result);
    };
    ipcRenderer.on(channelWait, _listener);
    return {
      dispose: () => {
        ipcRenderer.removeListener(channelWait, _listener);
      },
    };
  }

  /**
   * ?????? Renderer ???????????????
   * ???????????? name??????????????? webContetnsId ???????????????????????????????????????????????? Renderer EventService ??? onWebContentsWait???
   * > ?????????????????? webContents??????????????????????????????????????????????????? Main ????????????????????????????????????????????????
   * > https://github.com/electron/electron/issues/7193
   * @param name
   * @param payload
   */
  emitToWebContentsThen<T = any>(webContentsId: number, name: string, payload: any) {
    const _meta = {
      count: this.count,
    };

    ipcRenderer.sendTo(webContentsId, `${this.eventPrefix}onWebContentsWait:${name}`, payload, _meta);

    return new Promise<T>((resolve, reject) => {
      const channel = `${this.eventPrefix}onWebContentsReply:${name}:${this.count++}`;

      const _listener = async (e: IpcRendererEvent, result: T) => {
        ipcRenderer.removeListener(channel, _listener);
        resolve(result);
      };

      ipcRenderer.on(channel, _listener);

      setTimeout(() => {
        ipcRenderer.removeListener(channel, _listener);
        reject(new Error(`[Renderer] ${channel} reply timeout.`));
      }, DEFAULT_THEN_TIMEOUT);
    });
  }
}
