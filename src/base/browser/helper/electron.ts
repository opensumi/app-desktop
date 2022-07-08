import { ipcRenderer, IpcRendererEvent } from 'electron';
import { IElectronMainApi } from '@opensumi/ide-core-common/lib/electron';
import type { IDisposable } from '@opensumi/ide-utils/lib/disposable';

export function createElectronMainApi(name: string): IElectronMainApi<any> {
  let id = 0;
  return new Proxy({
    on: (event: string, listener: (...args) => void): IDisposable => {
      const wrappedListener = (e: IpcRendererEvent, eventName, ...args) => {
        if (eventName === event) {
          return listener(...args);
        }
      };
      ipcRenderer.on(`event:${name}`, wrappedListener);
      return {
        dispose: () => {
          ipcRenderer.removeListener(`event:${name}`, wrappedListener);
        },
      };
    },
  }, {
    get: (target, method) => {
      if (method === 'on') {
        return target[method];
      }
      return async (...args: any) => new Promise((resolve, reject) => {
        const requestId = id++;
        ipcRenderer.send(`request:${name}`, method, requestId, ...args);
        const listener = (event, seqId, error, result) => {
          if (seqId === requestId) {
            ipcRenderer.removeListener(`response:${name}`, listener);
            if (error) {
              const e = new Error(error.message);
              e.stack = error.stack;
              reject(e);
            } else {
              resolve(result);
            }
          }
        };
        ipcRenderer.on(`response:${name}`, listener);
      });
    },
  });
}
