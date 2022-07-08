import { ipcMain } from 'electron';
import type { IDisposable } from '@opensumi/ide-utils/lib/disposable';
import { Disposable } from '@opensumi/ide-utils/lib/disposable';
import { getDebugLogger } from '@opensumi/ide-core-common/lib/log';
import { Injectable, Autowired, INJECTOR_TOKEN, Injector } from '@opensumi/di';

export interface IElectronMainApiProvider {}

export const IElectronMainApiRegistry = 'IElectronMainApiRegistry';

@Injectable()
export class ElectronMainApiRegistry {
  private apis: Map<string, ElectronMainApiProxy> = new Map();

  @Autowired(INJECTOR_TOKEN)
  injector: Injector;

  registerMainApi(name: string, api: IElectronMainApiProvider): IDisposable {
    if (this.apis.has(name)) {
      this.apis.get(name)!.dispose();
    }
    const proxy = this.injector.get(ElectronMainApiProxy, [name, api]);
    getDebugLogger().log(`注册Electron Main Api: ${name}`);
    this.apis.set(name, proxy);

    return {
      dispose: () => {
        if (this.apis.get(name) === proxy) {
          this.apis.delete(name);
        }
        proxy.dispose();
      },
    };
  }
}

@Injectable({ multiple: true })
export class ElectronMainApiProxy extends Disposable {
  constructor(name: string, target: IElectronMainApiProvider) {
    super();
    const requestHandler = async (event, method: string, requestId: number, ...args: any[]) => {
      try {
        if (!target[method] || typeof target[method] !== 'function') {
          throw new Error(`No Request Handler for ${name}.${method}`);
        }
        const result = await target[method].apply(target, args);
        if (!event.sender.isDestroyed()) {
          event.sender.send(`response:${name}`, requestId, undefined, result);
        }
      } catch (e) {
        getDebugLogger().error(e);
        const err = {
          message: e.message || e.toString(),
          stack: e.stack,
        };
        if (!event.sender.isDestroyed()) {
          event.sender.send(`response:${name}`, requestId, err);
        }
      }
    };
    ipcMain.on(`request:${name}`, requestHandler);

    this.addDispose({
      dispose: () => {
        ipcMain.removeAllListeners(`request:${name}`);
      },
    });
  }
}
